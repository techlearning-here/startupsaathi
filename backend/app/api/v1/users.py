"""User endpoints: current user (GET /users/me)."""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def users_me(current_user: dict = Depends(get_current_user)) -> dict:
    """Return current authenticated user info (AUTH-02.4)."""
    return current_user
