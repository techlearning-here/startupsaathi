"""JWT validation for Supabase Auth tokens. Used by protected route dependencies."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Verify Supabase JWT and return user identity.
    Raises 401 if missing or invalid token.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=503, detail="Auth not configured")
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {
        "id": user_id,
        "email": payload.get("email"),
    }
