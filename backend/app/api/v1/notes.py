"""Notes CRUD endpoints. NOTES-01: create, NOTES-02: list, NOTES-03: get one, NOTES-04: update, NOTES-05: delete."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/notes", tags=["notes"])


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a note by id. Only owner can delete. Returns 204 on success, 404 if not found or not owned. (NOTES-05)
    """
    try:
        client = get_supabase_client()
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Storage not configured")
    result = (
        client.table("notes")
        .delete()
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Note not found")


@router.put("/{note_id}")
async def update_note(
    note_id: UUID,
    payload: "NoteUpdate",
    current_user: dict = Depends(get_current_user),
):
    """
    Update a note by id. Only owner can update. Returns 404 if not found or not owned. (NOTES-04)
    """
    try:
        client = get_supabase_client()
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Storage not configured")
    row = {
        "body": payload.body.strip(),
        "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    if payload.title is not None:
        row["title"] = payload.title.strip() or None
    result = (
        client.table("notes")
        .update(row)
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return result.data[0]


@router.get("/{note_id}")
async def get_note(
    note_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Get a note by id. Returns 404 if not found or not owned by current user. (NOTES-03)
    """
    try:
        client = get_supabase_client()
    except RuntimeError:
        raise HTTPException(status_code=503, detail="Storage not configured")
    result = (
        client.table("notes")
        .select("*")
        .eq("id", str(note_id))
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return result.data[0]


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


class NoteUpdate(BaseModel):
    """Request body for updating a note. Body required, title optional."""

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
