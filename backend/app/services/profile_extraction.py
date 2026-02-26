import re
import difflib
from typing import Dict, Any, List

# Simple keyword mappings for demo purposes
OCCUPATION_KEYWORDS = {
    "farmer": ["farmer", "farming", "agriculture", "rythu", "krishi", "kisan", "crop", "framer", "farmar"],
    "student": ["student", "studying", "school", "college", "study", "scholar"],
    "widow": ["widow", "husband died", "widowed"],
    "worker": ["worker", "labour", "daily wage", "mnrega", "nrega"],
    "business": ["business", "shop", "vendor", "msme", "vyapar", "entrepreneur", "startup", "start up"],
    "senior": ["old", "senior", "aged", "retired", "buzurg", "pension"]
}

CATEGORY_KEYWORDS = {
    "student": ["student", "study", "college", "school", "scholarship", "education"],
    "farmer": ["farmer", "kisan", "krishi", "kheti", "agriculture", "crop", "farm", "framer"],
    "women": ["widow", "vidhwa", "woman", "women", "girl", "mother", "maternity", "pregnant", "aurat", "single mother"],
    "senior": ["old", "senior", "pension", "60", "retired", "buzurg", "aged"],
    "business": ["business", "vendor", "shop", "vyapar", "entrepreneur", "startup", "start up"],
    "worker": ["worker", "labour", "daily wage", "mazdoor", "unorganised", "employee", "jobless", "unemployed"]
}

STATE_KEYWORDS = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
    "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh",
    "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh",
    "uttarakhand", "west bengal", "andaman and nicobar islands", "chandigarh",
    "dadra and nagar haveli and daman and diu", "delhi", "jammu and kashmir",
    "ladakh", "lakshadweep", "puducherry"
]

def fuzzy_match(query_words: List[str], keywords: List[str], threshold: float = 0.8) -> bool:
    query_str = " ".join(query_words)
    for kw in keywords:
        if kw in query_str:
            return True
            
        kw_len = len(kw.split())
        if kw_len == 1:
            matches = difflib.get_close_matches(kw, query_words, n=1, cutoff=threshold)
            if matches:
                return True
        else:
            for i in range(len(query_words) - kw_len + 1):
                ngram = " ".join(query_words[i:i+kw_len])
                if difflib.SequenceMatcher(None, kw, ngram).ratio() >= threshold:
                    return True
    return False

def extract_profile(query: str) -> Dict[str, Any]:
    """
    Extracts profile attributes from text.
    """
    # Clean Input Normalization
    query_lower = query.lower()
    query_clean = re.sub(r'[^\w\s]', '', query_lower).strip()
    query_words = query_clean.split()
    
    profile: Dict[str, Any] = {
        "occupation": None,
        "income": None,
        "state": None,
        "age": None,
        "gender": None,
        "category": "general",
        "raw_query": query
    }
    
    # 1. Extract Occupation
    for occ, keywords in OCCUPATION_KEYWORDS.items():
        if fuzzy_match(query_words, keywords):
            profile["occupation"] = occ
            break
            
    # 2. Extract State (Strict Match > 86% Fuzzy Match)
    best_match = None
    best_ratio = 0.0

    # Pass 1: Exact matches
    for state in STATE_KEYWORDS:
        if state == query_clean or f" {state} " in f" {query_clean} ":
            best_match = state
            best_ratio = 1.0
            break
            
    # Pass 2: Fuzzy matching (only if no exact match, limit to >85%)
    if not best_match:
        for state in STATE_KEYWORDS:
            state_len = len(state.split())
            if state_len == 1:
                matches = difflib.get_close_matches(state, query_words, n=1, cutoff=0.86)
                if matches:
                    ratio = difflib.SequenceMatcher(None, state, matches[0]).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_match = state
            else:
                for i in range(len(query_words) - state_len + 1):
                    ngram = " ".join(query_words[i:i+state_len])
                    ratio = difflib.SequenceMatcher(None, state, ngram).ratio()
                    if ratio >= 0.86 and ratio > best_ratio:
                        best_ratio = ratio
                        best_match = state
                        
    if best_match:
        profile["state"] = best_match
            
    # 3. Extract Income (Basic Regex for numbers followed by income keywords)
    # Looks for things like "income is 50000" or "50k income"
    income_match = re.search(r'income.*?(\d{1,2}(?:,\d{3})+|\d+k|\d{2,})', query_lower)
    if not income_match:
        income_match = re.search(r'(\d{1,2}(?:,\d{3})+|\d+k|\d{2,}).*?income', query_lower)
        
    if income_match:
        val_str = income_match.group(1).replace(',', '')
        if 'k' in val_str:
            val = int(val_str.replace('k', '')) * 1000
        else:
            val = int(val_str)
        profile["income"] = val
    else:
        # Fallback keyword checks for income
        if "low income" in query_lower or "poor" in query_lower:
            profile["income"] = 50000 # Dummy value indicating low income

    # 4. Extract Age (Look for "X years old" or "age X")
    age_match = re.search(r'(\d{1,3})\s*years?\s*old', query_lower)
    if not age_match:
        age_match = re.search(r'age.*?\b(\d{1,3})\b', query_lower)
    if age_match:
         profile["age"] = int(age_match.group(1))

    # 5. Extract Gender
    if any(word in query_lower for word in [" woman", "female", "girl", "widow", "lady", "aurat"]):
        profile["gender"] = "female"
    elif any(word in query_lower for word in [" man", "male", "boy", "aadmi"]):
        profile["gender"] = "male"

    # 6. Extract Category
    category = "general"
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if fuzzy_match(query_words, keywords):
            category = cat
            break
            
    # Age-based category override
    if profile.get("age") and profile["age"] >= 60:
        category = "senior"
        
    profile["category"] = category

    # Fallback Handling
    if not profile["occupation"]:
        profile["occupation"] = "unknown"
    if not profile["income"]:
        profile["income"] = "unknown"
    if not profile["state"]:
        profile["state"] = "unknown"

    return profile

def generate_profile_summary(profile: Dict[str, Any]) -> str:
    summary = []
    if profile.get("occupation"):
        summary.append(profile["occupation"].capitalize())
    else:
        summary.append("Citizen")
        
    if profile.get("state") and profile["state"] != "unknown":
        summary.append(f"from {profile['state'].title()}")
        
    income = profile.get("income")
    if income == 50000:
        summary.append("with low income")
    elif isinstance(income, (int, float)):
        summary.append(f"with an estimated income of ₹{income}")
        
    if profile.get("age"):
         summary.append(f"(Age: {profile['age']})")
         
    return " ".join(summary)
