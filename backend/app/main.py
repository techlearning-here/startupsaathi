"""FastAPI app entry: health route, CORS, API router."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router

# CORS: allow frontend origin (set FRONTEND_URL on Render to your Vercel URL, no trailing slash)
_cors_origins = ["http://localhost:3000"]
if settings.FRONTEND_URL:
    url = settings.FRONTEND_URL.strip().rstrip("/")
    if url and url not in _cors_origins:
        _cors_origins.append(url)

app = FastAPI(
    title="LaunchMitra API",
    description="API for LaunchMitra / Lean MVP",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """UptimeRobot and load balancer health check (GET or HEAD)."""
    return {"status": "healthy", "version": "1.0.0"}
