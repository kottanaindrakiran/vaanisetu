# VaaniSetu Backend API

The VaaniSetu backend is a robust, voice-first AI assistant API built with FastAPI. It handles profile extraction from NLP queries, scores and matches government schemes, and formats responses for frontend speech synthesis and display.

## 🌟 Key Features
- **In-Memory Caching**: Schemes are cached into memory on startup for `<1s` response times.
- **Resilience & Fallbacks**: Auto-switches to local JSON (`data/fallback_schemes.json`) if the Supabase database is unreachable or credentials are not provided.
- **Empty Query Safety**: Gracefully handles short or empty inputs without crashing, prompting the user for more information.
- **Global Error Handling**: Catches all exceptions to return safe JSON fallbacks, avoiding 500 errors in production.
- **Explainability**: Provides `confidence` levels, a TTS-optimized `simple_reason`, and `estimated_value` calculations.
- **Demo Mode**: Call `/api/full-analysis?demo=true` to instantly return a guaranteed mock response for live presentations.

## 🛠 Required Setup

### 1. Environment Configuration
Create a `.env` file in the `backend/` directory. 
*Note: If these are omitted, the backend will safely run using local JSON data.*
```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Database Setup (Supabase)
1. Open the Supabase SQL Editor.
2. Form the contents of `scripts/setup_supabase.sql` and run the script to create the `schemes`, `user_queries`, and `analysis_results` tables.
3. This script also establishes secure **Row Level Security (RLS)** policies.

### 3. Install Dependencies
```bash
python -m venv venv
# Linux / Mac:
source venv/bin/activate  
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### 4. Seed Database
If you linked Supabase, populate it with the required 20+ sample Indian government schemes:
```bash
python scripts/populate_data.py
```

## 🚀 Running the Server
Start the FastAPI application:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

## 📡 Core Endpoints
- `POST /api/full-analysis`: Main NLP + Matching endpoint. Sends query, returns extracted profile, scored schemes, and speech text.
- `GET /api/health`: Provides detailed backend status (DB connection, Cache, Time).
- `GET /api/demo-response`: Pre-formatted successful farmer response.
- `GET /api/schemes`: Fetch raw schemes list directly from the database or fallback.
