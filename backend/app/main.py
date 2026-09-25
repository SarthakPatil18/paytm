from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api import auth, missions, documents, profile, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    await create_tables()
    yield


app = FastAPI(
    title="FinPath AI API",
    description="Phase 1 — Financial Journey Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/")
async def root():
    return {"message": "FinPath AI API — Phase 1", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
