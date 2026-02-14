"""Aggregates v1 API routers. Add notes, users, etc. here."""

from fastapi import APIRouter

from app.api.v1 import notes, users

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(notes.router)
