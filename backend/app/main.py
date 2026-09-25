from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api import auth, missions, documents, profile, ai, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    await create_tables()
    yield


app = FastAPI(
    title="FinPath AI API",
    description="Financial Journey Platform — Goal-first financial assistance",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
cors_origins = [o.strip() for o in settings.FRONTEND_URL.split(",") if o.strip()]
for fallback in ["http://localhost:3000", "http://127.0.0.1:3000"]:
    if fallback not in cors_origins:
        cors_origins.append(fallback)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(missions.router)
app.include_router(documents.router)
app.include_router(profile.router)
app.include_router(ai.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    return {"message": "FinPath AI API — v1.0", "status": "running"}


@app.get("/health")
async def health():
    from app.core.config import settings as s
    return {
        "status": "healthy",
        "version": "1.0.0",
        "ai_mode": "gemini" if s.LLM_API_KEY else "fallback",
        "environment": s.ENVIRONMENT,
    }
