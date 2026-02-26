from typing import List
from app.models.schemas import SchemeMatch

def generate_benefits_summary(schemes: List[SchemeMatch]) -> str:
    """
    Generates a summary text describing potential overall benefits from matched schemes.
    """
    if not schemes:
        return "We couldn't find any specific schemes matching your profile at the moment."
        
    if len(schemes) == 1:
        return f"We found 1 scheme tailored to you: {schemes[0].name}. {schemes[0].benefit}"
        
    summary = f"Good news! We found {len(schemes)} schemes you might be eligible for. "
    
    # Determine majority scheme type and flags
    type_counts = {}
    has_health = False
    has_high_training = False
    has_insurance = False
    has_financial = False
    
    for s in schemes:
        # Some mock schemes may not have scheme_type natively resolved in SchemeMatch, so we deduce if missing
        s_name = str(getattr(s, "name", "")).lower()
        targets_raw = getattr(s, "target_groups", []) or []
        targets = [str(t).lower() for t in targets_raw if t]
        
        # Determine fallback scheme_type
        stype = getattr(s, "scheme_type", None)
        if not stype:
             if "farmer" in targets or "kisan" in s_name or "krishi" in s_name or "fasal" in s_name:
                 stype = "farmer_support"
             elif "scholarship" in s_name or "education" in s_name or "vidya" in s_name:
                 stype = "education"
             elif "health" in s_name or "ayushman" in s_name or "medical" in s_name:
                 stype = "health"
             elif "training" in s_name or "kaushalya" in s_name or "skill" in s_name:
                 stype = "training"
             elif "bima" in s_name or "insurance" in s_name:
                 stype = "insurance"
             else:
                 stype = "financial_support"
                 
        conf = getattr(s, "confidence", "Low")
        if conf in ["High", "Medium", "high", "medium"]:
            type_counts[stype] = type_counts.get(stype, 0) + 1
            
            if "health" in stype or "ayushman" in s_name or "medical" in s_name or "vandana" in s_name:
                has_health = True
                
            if stype == "training":
                has_high_training = True
                
            if stype == "insurance" or "bima" in s_name:
                has_insurance = True
                
            if stype in ["financial_support", "pension"]:
                has_financial = True
            
    majority_type = max(type_counts, key=type_counts.get) if type_counts else "general"
    
    # Build personalized phrase parts dynamically
    parts = []
    
    if majority_type == "farmer_support":
         parts.extend(["provide direct agricultural income support", "access to farm credit", "protection against crop losses"])
    elif majority_type == "education":
         parts.extend(["provide scholarships", "education fee support"])
    else:
         # Fallback generic logic if neither is strictly majority
         if type_counts.get("education", 0) > 0:
              parts.append("help cover education expenses")
         elif type_counts.get("farmer_support", 0) > 0:
              parts.append("provide direct farmer income support")
         elif has_financial:
              parts.append("provide additional financial support")
              
    if has_health:
         parts.append("medical protection")
         
    if has_high_training:
         parts.append("employment/skill opportunities")
         
    if has_insurance and not has_health and majority_type not in ["farmer_support", "education"]:
         parts.append("financial protection")

    if parts:
         if len(parts) == 1:
             summary += f"These schemes may {parts[0]}."
         elif len(parts) == 2:
             summary += f"These schemes may {parts[0]} and {parts[1]}."
         else:
             # Oxford comma list for 3+ items
             formatted_list = ", ".join(parts[:-1]) + f", and {parts[-1]}"
             summary += f"These schemes may {formatted_list}."
    else:
         # Fallback snippet logic
         benefits = []
         for s in schemes[:2]:
             benefit_val = getattr(s, "benefit", "")
             if benefit_val:
                  b_text = benefit_val.split('.')[0]
                  benefits.append(f"[{s.name}]: {b_text}")
         if benefits:
             summary += "Key benefits include " + " and ".join(benefits) + "."
             
    return summary

def generate_speakable_text(schemes: List[SchemeMatch]) -> str:
    """
    Generates a concise, clear sentence optimized for Text-To-Speech.
    """
    if not schemes:
         return "I'm sorry, I couldn't find any relevant schemes for you right now."
         
    count = len(schemes)
    names_str = ", ".join([s.name for s in schemes[:2]])
    if count > 2:
         return f"You qualify for {count} schemes. The top ones are {names_str}. Please tap a scheme to read the full details and apply."
    elif count == 2:
         return f"You qualify for 2 schemes: {names_str}. You can review their details below."
    else:
         return f"You qualify for the {schemes[0].name} scheme. Read below for instructions on how to apply."
