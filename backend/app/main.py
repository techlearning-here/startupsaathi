"""FastAPI app entry: health route, CORS, API router."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="LaunchMitra API",
    description="API for LaunchMitra / Lean MVP",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """UptimeRobot and load balancer health check."""
    return {"status": "healthy", "version": "1.0.0"}
