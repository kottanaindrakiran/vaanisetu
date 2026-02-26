from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import endpoints
from app.services.scheme_matching import load_schemes_cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_schemes_cache()
        print("Schemes cache loaded successfully on startup.")
    except Exception as e:
        print(f"Failed to load schemes cache: {e}")
    yield

app = FastAPI(
    title="VaaniSetu Backend",
    description="Voice-first AI assistant backend API for discovering government schemes",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global error caught: {exc}")
    fallback_content = {
        "profile": {},
        "profile_summary": "System encountered an error.",
        "schemes": [],
        "benefits_summary": "We are currently experiencing technical difficulties. Please try again later.",
        "speakable_text": "We are currently experiencing technical difficulties. Please try again later.",
        "processing_time_ms": 0,
        "data_source": "Fallback / Safe Error Handler"
    }
    return JSONResponse(status_code=200, content=fallback_content)

# Configure CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/demo. In prod, update with frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(endpoints.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
