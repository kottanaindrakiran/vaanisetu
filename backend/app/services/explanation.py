from typing import Dict, Any, List

def generate_explanation(profile: Dict[str, Any], scheme: Dict[str, Any], matched_factors: List[str]) -> str:
    """
    Generates a simple, rural-friendly explanation text of why they match.
    """
    reasons = []
    
    # Check occupation
    if "Occupation" in matched_factors and profile.get("occupation"):
        reasons.append(f"you are a {profile['occupation']}")
        
    # Check income
    if "Income Level" in matched_factors or "Income (No Limit)" in matched_factors:
        if profile.get("income"):
            limit = scheme.get('income_limit')
            if limit:
                reasons.append(f"your income is below the ₹{limit} limit")
            else:
                reasons.append(f"your income meets the requirements")
        else:
            reasons.append("you meet the financial requirements")
            
    # Check age
    if "Age" in matched_factors and profile.get("age"):
        reasons.append(f"your age ({profile['age']}) is eligible")
        
    # Check state
    if "State" in matched_factors and profile.get("state"):
        reasons.append(f"you live in {profile['state'].title()}")
    elif "Location (All India)" in matched_factors:
         pass # No need to mention it if it's general
         
    if not reasons:
        return "You appear to be eligible based on the available scheme guidelines."
        
    explanation = "You likely qualify because "
    
    if len(reasons) == 1:
        explanation += reasons[0] + "."
    elif len(reasons) == 2:
        explanation += reasons[0] + " and " + reasons[1] + "."
    else:
        explanation += ", ".join(reasons[:-1]) + ", and " + reasons[-1] + "."
        
    return explanation
