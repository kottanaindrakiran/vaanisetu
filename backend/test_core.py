import requests, json

def test_query(q, state=None):
    payload = {'query': q, 'language': 'en'}
    if state:
        payload['state_hint'] = state
        
    r = requests.post(
        'http://localhost:8000/api/full-analysis', 
        json=payload
    )
    if r.status_code == 200:
        data = r.json()
        out = {"query": q, "state": state, "schemes": [], "summary": data.get("benefits_summary")}
        for scheme in data.get('schemes', []):
            out["schemes"].append({
               "name": scheme.get("name"),
               "score": scheme.get("score"),
               "eligibilityScore": scheme.get("eligibilityScore"),
               "confidence": scheme.get("confidence"),
               "simple_reason": scheme.get("simple_reason")
            })
        return out
    else:
        return {"error": r.status_code}

res = [
  test_query("I am a student looking for a scholarship"),
  test_query("I am a farmer looking for help")
]

with open('test_out.json', 'w') as f:
    json.dump(res, f, indent=2)
