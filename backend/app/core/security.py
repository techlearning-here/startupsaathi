"""JWT validation for Supabase Auth tokens. Supports legacy HS256 and JWKS (RS256/ES256)."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import PyJWKClient

from app.config import settings

security = HTTPBearer(auto_error=False)

# JWKS client for Supabase signing keys (RS256/ES256). Lazy-initialized, cached.
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    """Return cached JWKS client for SUPABASE_URL. Requires SUPABASE_URL to be set."""
    global _jwks_client
    if _jwks_client is None:
        url = (settings.SUPABASE_URL or "").rstrip("/") + "/auth/v1/.well-known/jwks.json"
        if not settings.SUPABASE_URL:
            raise HTTPException(status_code=503, detail="Auth not configured (JWKS URL missing)")
        _jwks_client = PyJWKClient(url)
    return _jwks_client


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Verify Supabase JWT and return user identity.
    Supports legacy HS256 (SUPABASE_JWT_SECRET) and Signing Keys via JWKS (RS256/ES256).
    Raises 401 if missing or invalid token.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        unverified = jwt.get_unverified_header(token)
    except Exception as e:
        detail = "Invalid token"
        if settings.DEBUG:
            detail = f"{detail}: {e!s}"
        raise HTTPException(status_code=401, detail=detail) from e

    alg = (unverified.get("alg") or "").upper()
    try:
        if alg == "HS256":
            if not settings.SUPABASE_JWT_SECRET:
                raise HTTPException(status_code=503, detail="Auth not configured (JWT secret required for HS256)")
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            # Signing Keys (RS256, ES256, etc.) via JWKS
            if not settings.SUPABASE_URL:
                raise HTTPException(status_code=503, detail="Auth not configured (JWKS URL required for RS256/ES256)")
            jwks = _get_jwks_client()
            signing_key = jwks.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256"],
                audience="authenticated",
            )
    except jwt.InvalidTokenError as e:
        detail = "Invalid token"
        if settings.DEBUG:
            detail = f"{detail}: {e!s}"
        raise HTTPException(status_code=401, detail=detail) from e
    except HTTPException:
        raise

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {
        "id": user_id,
        "email": payload.get("email"),
    }
