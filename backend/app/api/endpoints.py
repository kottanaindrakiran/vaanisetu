from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.schemas import (
    FullAnalysisRequest, 
    FullAnalysisResponse, 
    DemoResponse,
    StoreQueryRequest,
    Scheme,
    ProfileData
)
from app.services.profile_extraction import extract_profile, generate_profile_summary
from app.services.scheme_matching import match_schemes
from app.services.benefits_summary import generate_benefits_summary, generate_speakable_text
from app.db.supabase import supabase_client
import uuid
import time
from datetime import datetime
from app.services.scheme_matching import _DB_STATUS, _CACHED_SCHEMES

router = APIRouter()

@router.get("/health")
def root():
    return {
        "status": "ok",
        "database": _DB_STATUS,
        "cache_loaded": len(_CACHED_SCHEMES) > 0,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/schemes", response_model=List[Scheme])
def get_schemes():
    """Returns scheme list from Supabase."""
    try:
        response = supabase_client.table("schemes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/full-analysis", response_model=FullAnalysisResponse)
def full_analysis(request: FullAnalysisRequest, demo: bool = False):
    """
    Main Endpoint.
    1. Accepts user queries (typed or voice transcribed)
    2. Extracts profile
    3. Fetches & Scores schemes
    4. Generates explanation + benefits
    5. Stores query
    """
    if demo:
        print(f"Demo mode activated! Returning safe fallback for query: {request.query}")
        return get_demo_response()

    if not request.query or not request.query.strip() or len(request.query.strip()) < 3:
        # Never crash on empty query as per requirements, friendly fallback
        return FullAnalysisResponse(
            profile=ProfileData(),
            profile_summary="We need a little more information.",
            schemes=[],
            benefits_summary="Please describe your situation so we can help.",
            speakable_text="Please tell me about your situation so I can help.",
            processing_time_ms=0,
            data_source="Government scheme database and eligibility engine"
        )
        
    start_time = time.time()
    try:
        # 1. Profile Extraction
        profile_dict = extract_profile(request.query)
        if request.state_hint and not profile_dict.get("state"):
            profile_dict["state"] = request.state_hint
            
        profile_summary = generate_profile_summary(profile_dict)
        profile_data = ProfileData(**profile_dict)
        
        # 2. Scheme Matching
        schemes = match_schemes(profile_dict)
        
        is_unknown_profile = profile_dict.get("occupation") == "unknown" and profile_dict.get("category") == "general"
        follow_up_question = None
        
        if is_unknown_profile:
            profile_summary = "We need more information about your occupation."
            follow_up_question = "Are you a student, farmer, business owner, or senior citizen?"
            
            # Filter schemes down to max 3 general ones and downgrade any High confidence hits
            filtered_schemes = []
            for s in schemes:
                if "general" in s.target_groups or s.scheme_type in ["general", "insurance"]:
                    if s.confidence == "High":
                        s.confidence = "Medium"
                        s.eligibilityScore = "medium"
                    filtered_schemes.append(s)
                if len(filtered_schemes) >= 3:
                    break
            schemes = filtered_schemes
        
        # Lightweight logging
        print(f"[Query]: {request.query}")
        print(f"[Extracted Profile]: {profile_dict}")
        print(f"[Matched Schemes Count]: {len(schemes)}")
        
        # 3. Benefits & Text
        benefits = generate_benefits_summary(schemes)
        
        speakable_map = {
            "en": f"Based on your profile, I found {len(schemes)} government schemes you may be eligible for.",
            "hi": f"आपकी प्रोफ़ाइल के आधार पर, मुझे {len(schemes)} सरकारी योजनाएं मिली हैं जिनके लिए आप पात्र हो सकते हैं।",
            "ta": f"உங்கள் சுயவிவரத்தின் அடிப்படையில், நீங்கள் தகுதிபெறக்கூடிய {len(schemes)} அரசுத் திட்டங்களை நான் கண்டறிந்துள்ளேன்.",
            "te": f"మీ ప్రొఫైల్ ఆధారంగా, మీరు అర్హత సాధించే {len(schemes)} ప్రభుత్వ పథకాలను నేను కనుగొన్నాను."
        }
        speakable = speakable_map.get(request.language, speakable_map["en"])
        if len(schemes) == 0 or is_unknown_profile:
            speakable = "I couldn't find exact matches yet. Please tell me about your situation so I can help, or are you a student, farmer, business owner, or senior citizen?"

        proc_time = int((time.time() - start_time) * 1000)
        
        response = FullAnalysisResponse(
            profile=profile_data,
            profile_summary=profile_summary,
            schemes=schemes,
            benefits_summary=benefits,
            speakable_text=speakable,
            processing_time_ms=proc_time,
            data_source="Government scheme database and eligibility engine",
            follow_up_question=follow_up_question
        )
        
        # 4. Store query & results asynchronously (doing synchronously here for simplicity)
        try:
            if supabase_client:
                query_id = str(uuid.uuid4())
                supabase_client.table("user_queries").insert({
                    "id": query_id,
                    "query_text": request.query,
                    "detected_occupation": profile_dict.get("occupation"),
                    "detected_income": profile_dict.get("income"),
                    "detected_state": profile_dict.get("state"),
                    "detected_age": profile_dict.get("age"),
                }).execute()
                
                for s in schemes:
                    supabase_client.table("analysis_results").insert({
                        "id": str(uuid.uuid4()),
                        "query_id": query_id,
                        "scheme_name": s.name,
                        "score": s.score,
                        "reason": s.reason,
                    }).execute()
        except Exception as store_err:
             print(f"Non-fatal error storing to DB: {store_err}") # Log error cleanly
             
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing query: {e}")
        # Return helpful fallback only if explicitly asked, otherwise we need to see the error natively
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/store-query")
def store_query(request: StoreQueryRequest):
    """Stores a raw query specifically."""
    try:
        if not supabase_client:
            return {"message": "Query logged locally", "id": str(uuid.uuid4())}
            
        query_id = str(uuid.uuid4())
        data = {
            "id": query_id,
            "query_text": request.query_text,
            "detected_occupation": request.detected_occupation,
            "detected_income": request.detected_income,
            "detected_state": request.detected_state,
            "detected_age": request.detected_age
        }
        res = supabase_client.table("user_queries").insert(data).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo-response", response_model=DemoResponse)
def get_demo_response():
    """Returns fixed realistic response for hackathon safety."""
    return DemoResponse(
        profile=ProfileData(
            occupation="farmer",
            income=40000,
            state="Tamil Nadu",
            age=45
        ),
        profile_summary="Farmer from Tamil Nadu with low income",
        schemes=[
            {
                "name": "PM Kisan Samman Nidhi",
                "score": 92,
                "confidence": "High",
                "reason": "You likely qualify because you are a farmer and you meet the financial requirements.",
                "simple_reason": "You are a farmer, so this scheme suits you.",
                "documents": ["Aadhar Card", "Land Ownership Proof", "Bank Account Number"],
                "benefit": "₹6000 per year directly to your bank account.",
                "steps": ["Visit the local CSC center", "Register on PM-Kisan portal", "Verify Aadhar"],
                "matched_factors": ["Occupation", "Income (No Limit)", "Location (All India)"],
                "target_groups": ["farmer"],
                "estimated_value": "₹6000",
                "official_url": "https://pmkisan.gov.in/",
                "sample_form_url": None
            },
            {
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "score": 85,
                "confidence": "High",
                "reason": "As a farmer, you can insure your crops at subsidized rates.",
                "simple_reason": "As a farmer, you can insure your crops.",
                "documents": ["Aadhar Card", "Land records", "Sowing certificate"],
                "benefit": "Crop insurance at subsidized premiums.",
                "steps": ["Provide land details", "Pay premium", "Get policy ticket"],
                "matched_factors": ["Occupation", "Location (All India)"],
                "target_groups": ["farmer"],
                "estimated_value": "Insurance",
                "official_url": "https://pmfby.gov.in/",
                "sample_form_url": None
            },
            {
                "name": "Ayushman Bharat - PMJAY",
                "score": 70,
                "confidence": "Medium",
                "reason": "Health insurance coverage needs income verification.",
                "simple_reason": "Based on your income, this scheme is a good fit.",
                "documents": ["Aadhaar Card", "Ration card", "Income certificate"],
                "benefit": "Health cover of Rs. 5 lakhs per family per year.",
                "steps": ["Check eligibility on portal", "Visit empanelled hospital"],
                "matched_factors": ["Income Level"],
                "target_groups": ["general", "worker", "farmer", "women", "senior"],
                "estimated_value": "₹500000",
                "official_url": "https://pmjay.gov.in/",
                "sample_form_url": None
            }
        ],
        benefits_summary="Good news! We found 3 schemes tailored to you including PM Kisan Samman Nidhi and PMFBY.",
        speakable_text="You qualify for the PM Kisan Samman Nidhi scheme and 2 others. Read below for instructions on how to apply.",
        processing_time_ms=10,
        data_source="Government scheme database and eligibility engine"
    )
