import json
import os

filepath = r"C:\Users\kotta\Downloads\vaanisetu-your-scheme-guide-main\vaanisetu-your-scheme-guide-main\backend\data\fallback_schemes.json"

urls_map = {
    "PM Kisan Samman Nidhi": "https://pmkisan.gov.in/",
    "Ayushman Bharat PM-JAY": "https://pmjay.gov.in/",
    "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)": "https://nrega.nic.in/",
    "Pradhan Mantri Awas Yojana (PMAY-G)": "https://pmayg.nic.in/",
    "Indira Gandhi National Widow Pension Scheme": "https://nsap.nic.in/",
    "Uzhavar Sandhai Scheme": "https://www.myscheme.gov.in/",
    "PM SVANidhi": "https://pmsvanidhi.mohua.gov.in/",
    "Sukanya Samriddhi Yojana": "https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx",
    "Pradhan Mantri Suraksha Bima Yojana (PMSBY)": "https://www.myscheme.gov.in/",
    "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)": "https://www.myscheme.gov.in/",
    "Atal Pension Yojana (APY)": "https://www.npscra.nsdl.co.in/scheme-details.php",
    "Pradhan Mantri Mudra Yojana (PMMY)": "https://www.mudra.org.in/",
    "Pradhan Mantri Ujjwala Yojana (PMUY)": "https://www.pmuy.gov.in/",
    "Pradhan Mantri Matru Vandana Yojana (PMMVY)": "https://www.myscheme.gov.in/",
    "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)": "https://ddugky.gov.in/",
    "National Social Assistance Programme (Indira Gandhi National Old Age Pension)": "https://nsap.nic.in/",
    "Pradhan Mantri Fasal Bima Yojana (PMFBY)": "https://pmfby.gov.in/",
    "e-Shram Portal Registration": "https://eshram.gov.in/",
    "PM Vishwakarma Yojana": "https://pmvishwakarma.gov.in/",
    "Stand-Up India Scheme": "https://www.standupmitra.in/",
    "National Scholarship Portal (Pre-Matric)": "https://scholarships.gov.in/",
    "Post-Matric Scholarship Scheme": "https://scholarships.gov.in/",
    "Skill India Programs (PMKVY)": "https://www.pmkvyofficial.org/",
    "Startup India Seed Fund Scheme": "https://seedfund.startupindia.gov.in/",
    "Mukhya Mantri Kanya Sumangala Yojana": "https://mksy.up.gov.in/women_and_child/en",
    "Dr. Ambedkar Foundation National Relief": "https://www.myscheme.gov.in/",
    "Kisan Credit Card (KCC)": "https://www.myscheme.gov.in/schemes/kcc"
}

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for scheme in data:
    name = scheme["name"]
    # Fallback to myscheme if not explicitly found in my map
    official = urls_map.get(name, "https://www.myscheme.gov.in/")
    scheme["official_url"] = official
    
    # We will enforce null for sample_form_url indicating it's an online process everywhere
    # to avoid 404s and false homepage links
    scheme["sample_form_url"] = None

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print("Updated fallback_schemes.json smoothly.")
