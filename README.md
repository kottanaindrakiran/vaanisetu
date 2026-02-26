# 🌾 VaaniSetu

### AI-Powered Voice Assistant for Government Scheme Discovery

> Bridging the gap between citizens and government welfare through AI, voice, and intelligent eligibility matching.

<img width="1903" height="970" alt="image" src="https://github.com/user-attachments/assets/f40fa186-b3ac-4870-9f02-d91597c06b8c" />

<img width="1892" height="984" alt="image" src="https://github.com/user-attachments/assets/0a8e6ad4-4421-4a69-8015-3d0bddba96c1" />



---

## 🚀 Live Demo

🌐 **Frontend:**
[https://vaanisetufrontend.vercel.app/](https://vaanisetufrontend.vercel.app/)

🔗 **Backend API:**
[https://vaanisetu-o5re.onrender.com](https://vaanisetu-o5re.onrender.com)


---

## 🧠 What is VaaniSetu?

VaaniSetu is a voice-first AI system that helps citizens instantly discover government welfare schemes they are eligible for based on:

* Occupation (Student, Farmer, Senior Citizen, etc.)
* Income level
* State
* Basic profile details

Instead of navigating complex government portals, users can simply say:

> “I am a farmer from Andhra Pradesh with low income”

And receive:

* 🎯 Personalized scheme recommendations
* 📊 Eligibility match score (High / Partial / Low)
* 🧾 Required document checklist
* 📌 Step-by-step application guidance
* 🔗 Direct official government website links
* 💰 Estimated potential benefits

---

## 🚨 The Problem

Millions of eligible citizens in India miss government benefits due to:

* Lack of awareness
* Complicated portals
* Language barriers
* Low digital literacy
* Fragmented information

Government schemes exist.
Accessibility does not.

---

## 💡 Our Solution

VaaniSetu combines:

* 🧠 AI-based profile extraction
* 🏷 Rule-based eligibility scoring engine
* 🌍 State-aware filtering
* ⚡ In-memory caching for fast responses
* 🎤 Voice interaction using Web Speech API
* 📊 Explainable AI (“Why this score?”)

To transform scheme discovery into a simple, conversational experience.

---

## 🏗 System Architecture

Frontend (React + Vite + Tailwind + Framer Motion)
↓
Backend (FastAPI + Uvicorn on Render)
↓
Supabase (PostgreSQL Database)

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* TailwindCSS
* Framer Motion
* Web Speech API
* Vercel Deployment

### Backend

* FastAPI
* Pydantic v2
* Supabase Python Client
* Uvicorn
* Render Deployment

### Database

* Supabase (PostgreSQL)
* State-specific and national schemes
* In-memory scheme caching for performance

---

## 📂 Project Structure

```
vaanisetu/
│
├── backend/
│   ├── main.py
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── db/
│   │   ├── models/
│   │   └── core/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
└── README.md
```

---

## ⚙ Backend Setup (Local)

### 1️⃣ Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Create `.env` file

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4️⃣ Run Backend

```bash
uvicorn main:app --reload
```

---

## 🌐 Frontend Setup (Local)

```bash
cd frontend
npm install
npm run dev
```

Add `.env`:

```
VITE_API_URL=http://localhost:8000
```

---

## 🧪 API Endpoints

* `GET /api/health`
* `POST /api/full-analysis`
* `GET /api/schemes`
* `GET /api/demo-response`

---

## 🛡 Security & Best Practices

* Environment variables stored securely in Render
* No API keys committed to GitHub
* Service role key used only in backend
* Fallback mode if database unavailable
* Clean separation between frontend and backend

---

## 🏆 Hackathon Value

* AI-powered eligibility engine
* State-specific intelligent filtering
* Voice-first accessibility for rural users
* Production-ready cloud deployment
* Explainable scoring logic

---

## 👨‍💻 Author

Indrakiran Kottana
AI for Good Hackathon 2026
Computer Science Engineering Student

