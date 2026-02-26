export interface Scheme {
  id: string;
  name: string;
  eligibilityScore?: "high" | "medium" | "low";
  confidence?: "High" | "Medium" | "Low";
  reason: string;
  simple_reason?: string;
  documents: string[];
  steps: string[];
  officialLink?: string;
}

export const mockSchemes: Scheme[] = [
  {
    id: "1",
    name: "PM-KISAN Samman Nidhi",
    eligibilityScore: "high",
    reason: "You qualify because your income is below ₹2 lakh and you own farmland.",
    documents: ["Aadhaar Card", "Land ownership papers", "Bank passbook"],
    steps: [
      "Visit your nearest CSC center",
      "Fill the PM-KISAN registration form",
      "Submit documents for verification",
      "Receive ₹6,000/year in 3 installments",
    ],
    officialLink: "https://pmkisan.gov.in",
  },
  {
    id: "2",
    name: "Pradhan Mantri Fasal Bima Yojana",
    eligibilityScore: "high",
    reason: "As a farmer, you can insure your crops at subsidized rates.",
    documents: ["Aadhaar Card", "Land records", "Sowing certificate", "Bank account details"],
    steps: [
      "Contact your bank or insurance company",
      "Fill the crop insurance application",
      "Pay the premium amount",
      "Get your policy document",
    ],
    officialLink: "https://pmfby.gov.in",
  },
  {
    id: "3",
    name: "Mahatma Gandhi NREGA",
    eligibilityScore: "medium",
    reason: "You may qualify for 100 days of guaranteed employment.",
    documents: ["Aadhaar Card", "Job card (if available)", "Bank passbook"],
    steps: [
      "Apply for a Job Card at Gram Panchayat",
      "Request work in writing",
      "Work will be provided within 15 days",
      "Wages paid directly to bank account",
    ],
    officialLink: "https://nrega.nic.in",
  },
  {
    id: "4",
    name: "Ayushman Bharat - PMJAY",
    eligibilityScore: "low",
    reason: "Health insurance coverage needs income verification.",
    documents: ["Aadhaar Card", "Ration card", "Income certificate"],
    steps: [
      "Check eligibility on mera.pmjay.gov.in",
      "Visit nearest Ayushman Mitra",
      "Get your e-card generated",
      "Avail cashless treatment at empanelled hospitals",
    ],
    officialLink: "https://pmjay.gov.in",
  },
];

export const mockHelpCenters = [
  { id: "1", name: "District Collector Office", distance: "2.3 km", address: "Main Road, District HQ" },
  { id: "2", name: "Common Service Centre (CSC)", distance: "1.1 km", address: "Near Bus Stand, Village Center" },
  { id: "3", name: "Gram Panchayat Office", distance: "0.5 km", address: "Village Square" },
  { id: "4", name: "Post Office (India Post)", distance: "1.8 km", address: "Market Street" },
];
