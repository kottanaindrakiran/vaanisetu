import re

content = open('scripts/populate_data.py', 'r', encoding='utf-8').read()

scheme_types = {
    'PM Kisan Samman Nidhi': 'farmer_support',
    'Ayushman Bharat PM-JAY': 'health',
    'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)': 'financial_support',
    'Pradhan Mantri Awas Yojana (PMAY-G)': 'housing',
    'Indira Gandhi National Widow Pension Scheme': 'pension',
    'Uzhavar Sandhai Scheme': 'farmer_support',
    'PM SVANidhi': 'financial_support',
    'Sukanya Samriddhi Yojana': 'women_specific',
    'Pradhan Mantri Suraksha Bima Yojana (PMSBY)': 'financial_support',
    'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)': 'financial_support',
    'Atal Pension Yojana (APY)': 'pension',
    'Pradhan Mantri Mudra Yojana (PMMY)': 'financial_support',
    'Pradhan Mantri Ujjwala Yojana (PMUY)': 'financial_support',
    'Pradhan Mantri Matru Vandana Yojana (PMMVY)': 'women_specific',
    'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)': 'training',
    'National Social Assistance Programme (Indira Gandhi National Old Age Pension)': 'pension',
    'Pradhan Mantri Fasal Bima Yojana (PMFBY)': 'farmer_support',
    'e-Shram Portal Registration': 'financial_support',
    'PM Vishwakarma Yojana': 'training',
    'Stand-Up India Scheme': 'financial_support',
    'National Scholarship Portal (Pre-Matric)': 'education',
    'Post-Matric Scholarship Scheme': 'education',
    'Skill India Programs (PMKVY)': 'training',
    'Startup India Seed Fund Scheme': 'financial_support',
    'Mukhya Mantri Kanya Sumangala Yojana': 'women_specific',
    'Dr. Ambedkar Foundation National Relief': 'financial_support',
    'Kisan Credit Card (KCC)': 'farmer_support',
    'Beti Bachao Beti Padhao': 'women_specific',
    'Swavalamban Yojana': 'pension',
    'Indira Gandhi National Disability Pension': 'pension'
}

for name, stype in scheme_types.items():
    pattern = r'("name":\s*"' + re.escape(name) + r'",.*?"target_groups":\s*\[[^\]]*\])'
    replacement = r'\1,\n        "scheme_type": "' + stype + r'"'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

open('scripts/populate_data.py', 'w', encoding='utf-8').write(content)
print("done")
