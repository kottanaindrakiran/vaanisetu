import json
from app.services.profile_extraction import extract_profile
from app.services.scheme_matching import match_schemes
from app.services.benefits_summary import generate_benefits_summary

tests = [
    "Student from Tamil Nadu",
    "Farmer from Andhra Pradesh",
    "Senior citizen from Rajasthan",
    "Tailor from Kerala" # Fallback
]

with open("test_results.txt", "w", encoding="utf-8") as f:
    for t in tests:
        f.write(f"\n--- QUERY: {t} ---\n")
        profile = extract_profile(t)
        
        schemes = match_schemes(profile)
        for i, s in enumerate(schemes):
            f.write(f"  {i+1}. [{s.confidence}] {s.name} (Targets: {s.target_groups})\n")
            
        summary = generate_benefits_summary(schemes)
        f.write(f"\n  BENEFITS SUMMARY: {summary}\n")

