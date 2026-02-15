"""User endpoints: current user (GET /users/me), avatar upload (AVATAR-01, AVATAR-02)."""

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import settings
from app.core.security import get_current_user
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/users", tags=["users"])

AVATAR_BUCKET = "avatars"
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2 MB


def _get_avatar_url(path: str) -> str:
    """Build public URL for an object in the avatars bucket."""
    base = (settings.SUPABASE_URL or "").rstrip("/")
    return f"{base}/storage/v1/object/public/{AVATAR_BUCKET}/{path}"


def _upload_to_storage(path: str, body: bytes, content_type: str) -> None:
    """Upload file to Supabase Storage via REST API. Use service_role key (SUPABASE_KEY)."""
    base = (settings.SUPABASE_URL or "").rstrip("/")
    key = settings.SUPABASE_KEY
    if not base or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
    url = f"{base}/storage/v1/object/{AVATAR_BUCKET}/{path}"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(url, content=body, headers=headers)
    if resp.status_code >= 400:
        msg = resp.text or resp.reason_phrase
        raise RuntimeError(f"Storage upload failed: {resp.status_code} {msg}")


@router.get("/me")
async def users_me(current_user: dict = Depends(get_current_user)) -> dict:
    """Return current authenticated user info including avatar_url (AUTH-02.4, AVATAR-02)."""
    user_id = current_user.get("id")
    if not user_id:
        return current_user
    try:
        client = get_supabase_client()
        row = (
            client.table("profiles")
            .select("avatar_url")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        profile = (row.data or {}) if row.data is not None else {}
        avatar_url = profile.get("avatar_url") if isinstance(profile, dict) else None
    except Exception:
        avatar_url = None
    return {**current_user, "avatar_url": avatar_url}


@router.post("/me/avatar")
async def upload_avatar(
    current_user: dict = Depends(get_current_user),
    file: UploadFile = File(...),
) -> dict:
    """Upload or replace avatar image (AVATAR-01). Stores in Supabase Storage, upserts profiles.avatar_url."""
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Allowed types: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )
    ext = "jpg" if content_type == "image/jpeg" else "png" if content_type == "image/png" else "webp"
    path = f"{user_id}.{ext}"
    body = await file.read()
    if len(body) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=422, detail="File too large (max 2 MB)")
    try:
        _upload_to_storage(path, body, content_type)
    except Exception as e:
        detail = "Storage upload failed. Create an 'avatars' bucket in Supabase (Storage → New bucket, set Public)."
        if settings.DEBUG:
            detail = f"{detail} Error: {e!s}"
        raise HTTPException(status_code=503, detail=detail) from e
    avatar_url = _get_avatar_url(path)
    try:
        client = get_supabase_client()
        client.table("profiles").upsert(
            [{"id": user_id, "avatar_url": avatar_url}],
            on_conflict="id",
        ).execute()
    except Exception as e:
        detail = "Profile update failed. Run docs/lean_mvp/profiles-and-avatars.sql in Supabase SQL Editor to create the profiles table."
        if settings.DEBUG:
            detail = f"{detail} Error: {e!s}"
        raise HTTPException(status_code=503, detail=detail) from e
    return {"avatar_url": avatar_url}
