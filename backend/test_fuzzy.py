import json
from app.services.profile_extraction import extract_profile

test_query = "I am a framer from andhra prasesh with low income"
result = extract_profile(test_query)

print(json.dumps(result, indent=2))
