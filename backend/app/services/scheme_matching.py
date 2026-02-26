from typing import List, Dict, Any
from app.db.supabase import supabase_client
from app.services.explanation import generate_explanation
from app.models.schemas import SchemeMatch

import json
import os

_CACHED_SCHEMES = []
_DB_STATUS = "disconnected"

def load_schemes_cache():
    global _CACHED_SCHEMES, _DB_STATUS
    try:
        if not supabase_client:
            raise ValueError("Supabase client not initialized")
        response = supabase_client.table("schemes").select("*").execute()
        _CACHED_SCHEMES = response.data
        _DB_STATUS = "connected"
        print("Successfully loaded schemes from Supabase.")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}. Falling back to local schemes map.")
        _DB_STATUS = "fallback"
        # Try local fallback
        fallback_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "fallback_schemes.json")
        try:
            with open(fallback_path, 'r', encoding='utf-8') as f:
                _CACHED_SCHEMES = json.load(f)
            print("Successfully loaded schemes from local fallback JSON.")
        except Exception as fe:
            print(f"FAILED to load fallback JSON natively: {fe}")
            _CACHED_SCHEMES = []

def get_cached_schemes():
    global _CACHED_SCHEMES
    if not _CACHED_SCHEMES:
        load_schemes_cache()
    return _CACHED_SCHEMES

def match_schemes(profile: Dict[str, Any]) -> List[SchemeMatch]:
    """
    Fetches schemes from memory cache and applies the 40-30-20-10 scoring logic.
    """
    schemes = get_cached_schemes()
    
    if not schemes:
        return []

    ranked = []
    
    for scheme in schemes:
        score = 0
        matched_factors = []
        
        # 1. Strict Category / Target Group Pre-Filter (and Scoring)
        scheme_targets = scheme.get("target_groups") or []
        user_cat = profile.get("category", "general")
        scheme_type = scheme.get("scheme_type", "general")
        
        # Hardcode explicit type classification to override any stale DB tags
        raw_name = scheme.get("name")
        scheme_name_lower = str(raw_name).lower() if raw_name else ""
        if "bima" in scheme_name_lower or "insurance" in scheme_name_lower:
            scheme_type = "insurance"
        elif "pension" in scheme_name_lower:
            scheme_type = "pension"
            
        user_gender = (profile.get("gender") or "unknown").lower()
        
        # Women-Specific Filter
        if scheme_type == "women_specific" and user_gender != "female" and user_cat != "women":
            continue
            
        # STOP: Hard Filter - if scheme doesn't target the user's category AND isn't general, skip entirely
        if user_cat not in scheme_targets and "general" not in scheme_targets:
            continue
            
        # Give points for direct match vs general
        is_primary = False
        if user_cat in scheme_targets and user_cat != "general":
            score += 40
            matched_factors.append(f"Category ({user_cat.capitalize()})")
            
            # Dynamic Priority Scoring
            if user_cat == "student":
                if scheme_type == "education":
                    score += 25
                    is_primary = True
                elif scheme_type == "financial_support":
                    score += 15
                elif scheme_type == "training":
                    score += 5
            elif user_cat == "farmer" and scheme_type == "farmer_support":
                score += 25
                is_primary = True
            elif user_cat == "business" and scheme_type in ["financial_support", "business"]:
                score += 25
                is_primary = True
            elif user_cat == "women" and scheme_type == "women_specific":
                score += 25
                is_primary = True
            elif user_cat == "senior" and scheme_type == "pension":
                score += 25
                is_primary = True
            elif user_cat == "worker" and scheme_type in ["financial_support", "training", "employment"]:
                score += 25
                is_primary = True
        elif "general" in scheme_targets:
            score += 20  # Partial points for general schemes
            matched_factors.append("Category (General)")
            
        if user_cat == "student" and scheme_type in ["insurance", "general", "pension"]:
            score -= 20
            
        # 2. Occupation Match (30 pts)
        if profile.get("occupation") and scheme.get("eligible_occupations"):
            occ_lower = str(profile["occupation"]).lower()
            eligible_occs = [str(o).lower() for o in scheme["eligible_occupations"] if o]
            if occ_lower in eligible_occs:
                score += 30
                matched_factors.append("Occupation")
            elif "all" in eligible_occs:
                 score += 10 # Only give 10 points for a generic "all" match to prevent it dominating
                 matched_factors.append("Occupation (General)")
        elif not scheme.get("eligible_occupations") or "all" in [str(o).lower() for o in scheme.get("eligible_occupations", []) if o]:
            # Give points if scheme is highly generic
            score += 10
            matched_factors.append("Occupation (General)")
            
        # 2. Income Eligibility (30 pts)
        scheme_income_limit = scheme.get("income_limit")
        if scheme_income_limit:
            if profile.get("income") and isinstance(profile["income"], (int, float)):
                if profile["income"] <= scheme_income_limit:
                    score += 30
                    matched_factors.append("Income Level")
            else:
                 # If income limit exists but user didn't provide income or it's unknown, give partial/no points
                 pass
        else:
             score += 30 # No income limit = anyone eligible
             matched_factors.append("Income (No Limit)")
             
        # 3. Age Eligibility (20 pts)
        user_age = profile.get("age")
        min_age = scheme.get("min_age")
        max_age = scheme.get("max_age")
        
        age_eligible = True
        if user_age:
            if min_age and user_age < min_age: age_eligible = False
            if max_age and user_age > max_age: age_eligible = False
            
        if age_eligible:
            score += 20
            if user_age:
                 matched_factors.append("Age")
        
        # 4. Strict State / Region Relevance Filter (10 pts or Exclude)
        raw_state = profile.get("state")
        user_state = str(raw_state).lower() if raw_state else ""
        
        raw_scheme_states = scheme.get("states") or ["all"]
        scheme_states = [str(s).lower() for s in raw_scheme_states if s]
        is_national = any(ns in scheme_states for ns in ["all", "national", "india", "central"])
        is_state_specific = False
        
        # If the user provided a state and the scheme is not "all" or "national" or "india", it MUST match.
        if user_state and user_state != "unknown":
            if not is_national and user_state not in scheme_states:
                # Failing explicit state check -> completely exclude scheme
                continue 
                
            if user_state in scheme_states and not is_national:
                score += 30  # Give a huge boost to state specific schemes
                matched_factors.append("State")
                is_state_specific = True
            elif is_national:
                score += 10
                matched_factors.append("Location (All India)")
        else:
            # User state unknown
            if not is_national:
                # Failing explicit state check (scheme is specific but user state unknown) -> completely exclude scheme
                continue
                
            if is_national:
                score += 10
                matched_factors.append("Location (All India)")
            
        # Generate explanations via service
        reason = generate_explanation(profile, scheme, matched_factors)
        
        # Determine simple reason based on occupation priority
        simple_reason = "This scheme matches your profile."
        if "general" in scheme_targets or scheme_type in ["insurance", "general"]:
            simple_reason = "Available to all eligible citizens."
        elif scheme_type == "education":
            simple_reason = "This scholarship helps students pay school or college fees."
        elif scheme_type == "training":
            simple_reason = "This program offers skill training for employment."
        elif scheme_type == "farmer_support":
            simple_reason = "This scheme provides direct support to farmers for agriculture."
        elif scheme_type == "financial_support":
            simple_reason = "This scheme offers financial assistance for your needs."
        elif scheme_type == "housing":
            simple_reason = "This scheme helps with housing and accommodation."
        elif scheme_type == "health":
            simple_reason = "This scheme provides health and medical benefits."
        elif scheme_type == "pension":
            simple_reason = "This provides regular pension or retirement benefits."
        elif scheme_type == "women_specific":
            simple_reason = "This is a dedicated welfare scheme for women."
        elif "Occupation" in matched_factors and profile.get("occupation") and profile["occupation"] != "unknown":
            simple_reason = f"You are a {profile['occupation']}, so this scheme suits you."
        elif "Income Level" in matched_factors or "Income (No Limit)" in matched_factors:
            simple_reason = "Based on your income, this scheme is a good fit."
            
        # Determine estimated value
        estimated_value = None
        benefit_text = scheme.get("benefit_summary", "")
        if "Rs" in benefit_text or "lakh" in benefit_text or "₹" in benefit_text:
            # Simple heuristic
            estimated_value = benefit_text.split('.')[0]
        
        # Minimum Score Filter: 40
        if score >= 40:
            # Type-based overrides for Confidence
            if scheme_type == "education":
                confidence = "High" if score >= 65 else ("Medium" if score >= 50 else "Low")
            elif scheme_type == "training":
                confidence = "Medium" if score >= 60 else "Low"
            elif scheme_type in ["insurance", "general"]:
                confidence = "Low"
            elif user_cat == "student" and not is_primary:
                confidence = "Low"
            else:
                if is_primary and score >= 85:
                    confidence = "High"
                elif score >= 80:
                    confidence = "High"
                elif score >= 60:
                    confidence = "Medium"
                else:
                    confidence = "Low"
                    
            # Priority for sorting
            if is_state_specific:
                sort_priority = -1
            elif "general" in scheme_targets or scheme_type in ["insurance", "general"]:
                sort_priority = 4
            elif scheme_type == "education":
                sort_priority = 1
            elif scheme_type == "financial_support" and user_cat == "student":
                sort_priority = 2
            elif scheme_type == "training":
                sort_priority = 3
            else:
                sort_priority = 2
                
            # CORE SCORING CORRECTION (Issue 1) - Enforce confidence floor 
            # If scheme_type matches user category, prevent normalization downgrades.
            is_core_match = False
            if (user_cat == "student" and scheme_type == "education") or \
               (user_cat == "farmer" and scheme_type == "farmer_support") or \
               (user_cat == "senior" and scheme_type == "pension"):
               is_core_match = True
               
            if is_core_match:
               score = max(score, 75)
               confidence = "High"
               
            ranked.append({
                "match": SchemeMatch(
                    name=scheme.get("name", "Unknown Scheme"),
                    score=score,
                    confidence=confidence,
                    eligibilityScore="low", # populated later
                    reason=reason,
                    simple_reason=simple_reason,
                    documents=scheme.get("documents", []),
                    benefit=scheme.get("benefit_summary", ""),
                    steps=scheme.get("apply_steps", []),
                    matched_factors=matched_factors,
                    target_groups=scheme_targets,
                    estimated_value=estimated_value,
                    official_url=scheme.get("official_url"),
                    sample_form_url=scheme.get("sample_form_url", None)
                ),
                "is_primary": is_primary,
                "is_core_match": is_core_match,
                "scheme_type": scheme_type,
                "score": score,
                "sort_priority": sort_priority,
                "is_state_specific": is_state_specific
            })
            
    # Sort ascending by sort_priority, then descending by raw score
    ranked.sort(key=lambda x: (x.get("sort_priority", 4), -x["score"]))
    
    # 4. Final Normalization Pass
    final_results = []
    
    MAX_HIGH_MATCHES = 2
    MAX_MEDIUM_MATCHES = 2
    high_assigned = 0
    medium_assigned = 0
    
    query_text = profile.get("raw_query", "").lower()
    explicit_training_keywords = ["job", "employment", "skill training", "unemployment", "skill"]
    has_explicit_training = any(kw in query_text for kw in explicit_training_keywords)
    
    for rank_idx, item in enumerate(ranked):
        match_obj = item["match"]
        scheme_type = item.get("scheme_type", "general")
        score = item["score"]
        is_primary_flag = item["is_primary"]
        
        # Override recommendation level explicitly based on rules
        if "insurance" in match_obj.name.lower() or "general" in item["match"].target_groups:
             match_obj.recommendation_level = "secondary"
        elif "training" in match_obj.name.lower() or "kaushalya" in match_obj.name.lower():
             match_obj.recommendation_level = "secondary"
        elif is_primary_flag:
             match_obj.recommendation_level = "primary"
        else:
             match_obj.recommendation_level = "secondary"

        # Apply Type Priority Capping
        confidence_cap = None
        if user_cat == "farmer":
            if scheme_type in ["health", "housing", "financial_support", "pension", "general", "insurance"] and not is_primary_flag:
                confidence_cap = "Medium"
        elif user_cat == "student":
            if scheme_type in ["general", "insurance"]:
                confidence_cap = "Low"
            elif scheme_type == "training" and not has_explicit_training:
                confidence_cap = "Medium"
                
        # Resolve Base Confidence
        if score < 40 or confidence_cap == "Low":
            raw_conf = "Low"
        elif score >= 60 and confidence_cap != "Medium":
            raw_conf = "High"
        elif score >= 50:
            raw_conf = "Medium"
        else:
            raw_conf = "Low"
            
        # Hard overrides
        if item.get("is_core_match") and confidence_cap not in ["Low", "Medium"]:
             raw_conf = "High" 
        elif scheme_type == "education" and user_cat == "student" and score >= 60:
             raw_conf = "High"
             
        # Apply strict distribution max caps
        if raw_conf == "High":
            if high_assigned < MAX_HIGH_MATCHES:
                match_obj.confidence = "High"
                high_assigned += 1
            elif medium_assigned < MAX_MEDIUM_MATCHES:
                match_obj.confidence = "Medium"
                medium_assigned += 1
            else:
                match_obj.confidence = "Low"
        elif raw_conf == "Medium":
            if medium_assigned < MAX_MEDIUM_MATCHES:
                match_obj.confidence = "Medium"
                medium_assigned += 1
            else:
                match_obj.confidence = "Low"
        else:
            match_obj.confidence = "Low"
            
        # Map the normalized backend confidence directly to frontend eligibilityScore expectation ("high", "medium", "low")
        match_obj.eligibilityScore = match_obj.confidence.lower()
             
        final_results.append({
            "match": match_obj,
            "sort_priority": item["sort_priority"],
            "scheme_type": scheme_type,
            "score": score
        })
        
    # Final Sort: priority first, then score
    final_results.sort(key=lambda x: (x.get("sort_priority", 4), -x["score"]))
    
    output_schemes = []
    
    for item in final_results:
        match_obj = item["match"]
        score = item["score"]
        scheme_type = item.get("scheme_type", "general")
        targets = getattr(match_obj, "target_groups", [])
        
        is_general = "general" in targets or scheme_type in ["general", "insurance"]
        
        # 3. Label general schemes
        if is_general:
            match_obj.simple_reason = f"Also Available Scheme: {match_obj.simple_reason}"
            
        # 2. & 4. & 5. Filter logic: don't force 5, only include general if they add value
        if len(output_schemes) < 3:
             # Always try to hit at least top 3 if score >= 40 
             if score >= 40:
                  output_schemes.append(match_obj)
        else:
             # After top 3, only include highly relevant schemes
             # If it's general, only include if score is very high (> 80) to avoid irrelevant spam
             if is_general and score > 80:
                  output_schemes.append(match_obj)
             # If it's a core scheme, include if score >= 50
             elif not is_general and score >= 50:
                  output_schemes.append(match_obj)
                  
        if len(output_schemes) >= 5:
             break
             
    return output_schemes
