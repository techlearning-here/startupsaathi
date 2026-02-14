"""Notes CRUD endpoints. NOTES-01: create note, NOTES-02: list notes."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("")
async def list_notes(
    current_user: dict = Depends(get_current_user),
):
    """
    List the authenticated user's notes, newest first. (NOTES-02)
    """
    try:
        client = get_supabase_client()
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Storage not configured")
    result = (
        client.table("notes")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("updated_at", ascending=False)
        .execute()
    )
    return result.data if result.data is not None else []


class NoteCreate(BaseModel):
    """Request body for creating a note. Body required, title optional."""

    body: str = Field(..., min_length=1, description="Note content")
    title: str | None = Field(None, description="Optional title")


@router.post("", status_code=201)
async def create_note(
    payload: NoteCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a note for the authenticated user. (NOTES-01)
    """
    try:
        client = get_supabase_client()
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Storage not configured")
    row = {
        "user_id": current_user["id"],
        "body": payload.body.strip(),
    }
    if payload.title is not None:
        row["title"] = payload.title.strip() or None
    result = client.table("notes").insert(row).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=500, detail="Note not created")
    return result.data[0]
