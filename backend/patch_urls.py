import json, sys
sys.path.append('.')
from scripts.populate_data import sample_schemes

urls = {
    "PM Kisan Samman Nidhi": "https://pmkisan.gov.in/",
    "Ayushman Bharat PM-JAY": "https://pmjay.gov.in/",
    "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)": "https://nrega.nic.in/",
    "Pradhan Mantri Awas Yojana (PMAY-G)": "https://pmayg.nic.in/",
    "Indira Gandhi National Widow Pension Scheme": "https://nsap.nic.in/",
    "Uzhavar Sandhai Scheme": "https://tnagrisnet.tn.gov.in/",
    "PM SVANidhi": "https://pmsvanidhi.mohua.gov.in/",
    "Sukanya Samriddhi Yojana": "https://www.indiapost.gov.in/",
    "Pradhan Mantri Suraksha Bima Yojana (PMSBY)": "https://jansuraksha.gov.in/",
    "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)": "https://jansuraksha.gov.in/",
    "Atal Pension Yojana (APY)": "https://npscra.nsdl.co.in/scheme-details.php",
    "Pradhan Mantri Mudra Yojana (PMMY)": "https://www.mudra.org.in/",
    "Pradhan Mantri Ujjwala Yojana (PMUY)": "https://www.pmuy.gov.in/",
    "Pradhan Mantri Matru Vandana Yojana (PMMVY)": "https://pmmvy.wcd.gov.in/",
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
    "Mukhya Mantri Kanya Sumangala Yojana": "https://mksy.up.gov.in/",
    "Dr. Ambedkar Foundation National Relief": "https://ambedkarfoundation.nic.in/",
    "Kisan Credit Card (KCC)": "https://pmkisan.gov.in/",
    "Beti Bachao Beti Padhao": "https://wcd.nic.in/bbbp-schemes",
    "Swavalamban Yojana": "https://npscra.nsdl.co.in/",
    "Indira Gandhi National Disability Pension": "https://nsap.nic.in/",
    "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme": "https://penkalvi.tn.gov.in/",
    "YSR Rythu Bharosa": "https://ysrrythubharosa.ap.gov.in/",
    "Mukhyamantri Vridhjan Samman Pension Yojana": "https://sje.rajasthan.gov.in/"
}

# Update fallback json
for scheme in sample_schemes:
    scheme["official_url"] = urls.get(scheme["name"], "")

with open('data/fallback_schemes.json', 'w', encoding='utf-8') as f:
    json.dump(sample_schemes, f, indent=4)

# Update python file rigidly
with open("scripts/populate_data.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if '"name": "' in line:
        name = line.split('"name": "')[1].split('"')[0]
        if name in urls:
            indent = line.split('"name"')[0]
            new_lines.append(f'{indent}"official_url": "{urls[name]}",\n')

with open("scripts/populate_data.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Rigid patch success!")
