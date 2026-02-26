import json
from app.services.profile_extraction import extract_profile

tests = [
    "I am a student from Andhra Pradesh",
    "I am a framer from andhra prasesh",
    "I live in Madhya Pradesh",
    "What about madhya prasesh",
    "I live nowhere"
]

for t in tests:
    print(f"QUERY: {t}")
    print(f"RESULT: {json.dumps(extract_profile(t), indent=2)}\n")
