"""Tests for notes API: POST (NOTES-01), GET list (NOTES-02), GET one (NOTES-03), PUT (NOTES-04), DELETE (NOTES-05)."""

import uuid
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.api.v1 import notes as notes_module
from app.config import settings

TEST_JWT_SECRET = "test-jwt-secret-for-notes01"
TEST_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
TEST_EMAIL = "test@example.com"


def _make_token(
    secret: str = TEST_JWT_SECRET,
    sub: str = TEST_USER_ID,
    email: str = TEST_EMAIL,
) -> str:
    """Build a Supabase-style JWT for testing."""
    payload = {
        "sub": sub,
        "email": email,
        "aud": "authenticated",
        "role": "authenticated",
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def valid_token() -> str:
    """Valid JWT with test user."""
    return _make_token(secret=TEST_JWT_SECRET)


@pytest.fixture(autouse=True)
def patch_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    """Use test secret so we can create valid tokens in tests."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)


@pytest.fixture
def mock_supabase(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    """Mock Supabase client so insert returns a note without hitting real DB."""
    mock_client = MagicMock()
    mock_table = MagicMock()

    def insert_chain(data: dict):
        row = {
            "id": str(uuid.uuid4()),
            "user_id": data.get("user_id", TEST_USER_ID),
            "title": data.get("title"),
            "body": data.get("body", ""),
            "created_at": "2026-02-14T12:00:00Z",
            "updated_at": "2026-02-14T12:00:00Z",
        }
        result = MagicMock()
        result.data = [row]
        return MagicMock(execute=MagicMock(return_value=result))

    mock_table.insert.side_effect = insert_chain
    mock_client.table.return_value = mock_table
    monkeypatch.setattr(notes_module, "get_supabase_client", lambda: mock_client)
    return mock_client


def test_create_note_valid_body_returns_201(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-01.1: Valid JWT, body { \"body\": \"Hello\" } -> 201, note with correct user_id."""
    response = client.post(
        "/api/v1/notes",
        json={"body": "Hello"},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data.get("body") == "Hello"
    assert data.get("user_id") == TEST_USER_ID
    assert "id" in data
    assert "created_at" in data or "updated_at" in data
    mock_supabase.table.assert_called_once_with("notes")
    call_args = mock_supabase.table("notes").insert.call_args[0][0]
    assert call_args["body"] == "Hello"
    assert call_args["user_id"] == TEST_USER_ID


def test_create_note_title_and_body_returns_201(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-01.2: Valid JWT, title + body -> note has title and body."""
    response = client.post(
        "/api/v1/notes",
        json={"title": "Hi", "body": "World"},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data.get("title") == "Hi"
    assert data.get("body") == "World"
    call_args = mock_supabase.table("notes").insert.call_args[0][0]
    assert call_args["title"] == "Hi"
    assert call_args["body"] == "World"


def test_create_note_empty_body_returns_422(
    client: TestClient, valid_token: str,
) -> None:
    """NOTES-01.3: Valid JWT, body {} (no body) -> 422 validation error."""
    response = client.post(
        "/api/v1/notes",
        json={},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 422


def test_create_note_no_jwt_returns_401(client: TestClient, mock_supabase: MagicMock) -> None:
    """NOTES-01.4: No JWT -> 401."""
    response = client.post("/api/v1/notes", json={"body": "Hello"})
    assert response.status_code == 401


def test_create_note_invalid_jwt_returns_401(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-01.4: Invalid JWT -> 401."""
    response = client.post(
        "/api/v1/notes",
        json={"body": "Hello"},
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


# --- NOTES-02: List notes ---

USER_B_ID = "b2c3d4e5-f6a7-8901-bcde-f23456789012"


def test_list_notes_returns_only_current_user_notes(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-02.1: User A has 2 notes, User B has 1 -> User A gets only 2 notes, all user_id=A."""
    two_notes = [
        {
            "id": str(uuid.uuid4()),
            "user_id": TEST_USER_ID,
            "title": "First",
            "body": "Body 1",
            "created_at": "2026-02-14T10:00:00Z",
            "updated_at": "2026-02-14T12:00:00Z",
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": TEST_USER_ID,
            "title": "Second",
            "body": "Body 2",
            "created_at": "2026-02-14T11:00:00Z",
            "updated_at": "2026-02-14T13:00:00Z",
        },
    ]
    mock_select = MagicMock()
    mock_select.eq.return_value.order.return_value.execute.return_value = MagicMock(
        data=two_notes
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        "/api/v1/notes",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert all(n.get("user_id") == TEST_USER_ID for n in data)
    mock_supabase.table.assert_called_with("notes")
    mock_select.eq.assert_called_once_with("user_id", TEST_USER_ID)


def test_list_notes_empty_returns_200(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-02.2: User has no notes -> 200, empty list."""
    mock_select = MagicMock()
    mock_select.eq.return_value.order.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        "/api/v1/notes",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_list_notes_ordered_by_updated_at_desc(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-02.3: Notes ordered by updated_at desc."""
    ordered = [
        {"id": "1", "user_id": TEST_USER_ID, "updated_at": "2026-02-14T13:00:00Z"},
        {"id": "2", "user_id": TEST_USER_ID, "updated_at": "2026-02-14T12:00:00Z"},
    ]
    mock_select = MagicMock()
    mock_select.eq.return_value.order.return_value.execute.return_value = MagicMock(
        data=ordered
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        "/api/v1/notes",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    mock_select.eq.return_value.order.assert_called_once_with(
        "updated_at", desc=True
    )


def test_list_notes_no_jwt_returns_401(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-02.4: No JWT -> 401."""
    response = client.get("/api/v1/notes")
    assert response.status_code == 401


def test_list_notes_invalid_jwt_returns_401(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-02.4: Invalid JWT -> 401."""
    response = client.get(
        "/api/v1/notes",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


# --- NOTES-03: Get single note ---

NOTE_ID_OWNED = "c3d4e5f6-a7b8-9012-cdef-345678901234"
NOTE_ID_OTHER = "d4e5f6a7-b8c9-0123-def0-456789012345"


def test_get_note_owner_returns_200(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-03.1: User A owns note N -> GET /notes/{N.id} -> 200, note N."""
    note = {
        "id": NOTE_ID_OWNED,
        "user_id": TEST_USER_ID,
        "title": "My note",
        "body": "Content",
        "created_at": "2026-02-14T12:00:00Z",
        "updated_at": "2026-02-14T12:00:00Z",
    }
    mock_select = MagicMock()
    mock_select.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[note]
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == NOTE_ID_OWNED
    assert data["body"] == "Content"
    mock_select.eq.assert_called_once_with("id", NOTE_ID_OWNED)
    mock_select.eq.return_value.eq.assert_called_once_with("user_id", TEST_USER_ID)


def test_get_note_non_owner_returns_404(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-03.2: User B does not own note N -> 404."""
    other_user_token = _make_token(sub=USER_B_ID)
    mock_select = MagicMock()
    mock_select.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {other_user_token}"},
    )
    assert response.status_code == 404


def test_get_note_invalid_uuid_returns_422(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-03.3: Invalid UUID -> 422."""
    response = client.get(
        "/api/v1/notes/not-a-uuid",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 422


def test_get_note_not_found_returns_404(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-03.4: Valid UUID but note not found -> 404."""
    mock_select = MagicMock()
    mock_select.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.select.return_value = mock_select

    response = client.get(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 404


# --- NOTES-04: Update note ---

def test_update_note_owner_returns_200(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-04.1: User A owns note N -> PUT with new title/body -> 200, note updated."""
    updated_note = {
        "id": NOTE_ID_OWNED,
        "user_id": TEST_USER_ID,
        "title": "New title",
        "body": "New body",
        "created_at": "2026-02-14T12:00:00Z",
        "updated_at": "2026-02-14T14:00:00Z",
    }
    mock_update = MagicMock()
    mock_update.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[updated_note]
    )
    mock_supabase.table.return_value.update.return_value = mock_update

    response = client.put(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        json={"title": "New title", "body": "New body"},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New title"
    assert data["body"] == "New body"
    mock_supabase.table.return_value.update.assert_called_once()
    call_args = mock_supabase.table.return_value.update.call_args[0][0]
    assert call_args["body"] == "New body"
    assert call_args["title"] == "New title"


def test_update_note_non_owner_returns_404(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-04.2: User B does not own note N -> 404."""
    other_token = _make_token(sub=USER_B_ID)
    mock_update = MagicMock()
    mock_update.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.update.return_value = mock_update

    response = client.put(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        json={"body": "Other"},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 404


def test_update_note_empty_body_returns_422(
    client: TestClient, valid_token: str,
) -> None:
    """NOTES-04.3: PUT with body '' -> 422."""
    response = client.put(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        json={"body": ""},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 422


def test_update_note_body_only_returns_200(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-04.4: PUT with only body (no title) -> body updated."""
    updated_note = {
        "id": NOTE_ID_OWNED,
        "user_id": TEST_USER_ID,
        "title": None,
        "body": "Only body updated",
        "created_at": "2026-02-14T12:00:00Z",
        "updated_at": "2026-02-14T14:00:00Z",
    }
    mock_update = MagicMock()
    mock_update.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[updated_note]
    )
    mock_supabase.table.return_value.update.return_value = mock_update

    response = client.put(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        json={"body": "Only body updated"},
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    assert response.json()["body"] == "Only body updated"
    call_args = mock_supabase.table.return_value.update.call_args[0][0]
    assert call_args["body"] == "Only body updated"
    assert "title" not in call_args or call_args.get("title") is None


# --- NOTES-05: Delete note ---

def test_delete_note_owner_returns_204(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-05.1: User A owns note N -> DELETE -> 204, note removed."""
    mock_delete = MagicMock()
    mock_delete.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": NOTE_ID_OWNED}]
    )
    mock_supabase.table.return_value.delete.return_value = mock_delete

    response = client.delete(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 204
    mock_supabase.table.return_value.delete.assert_called_once()
    mock_delete.eq.assert_called_once_with("id", NOTE_ID_OWNED)
    mock_delete.eq.return_value.eq.assert_called_once_with("user_id", TEST_USER_ID)


def test_delete_note_non_owner_returns_404(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    """NOTES-05.2: User B does not own note N -> 404."""
    other_token = _make_token(sub=USER_B_ID)
    mock_delete = MagicMock()
    mock_delete.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.delete.return_value = mock_delete

    response = client.delete(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 404


def test_delete_note_already_deleted_returns_404(
    client: TestClient, valid_token: str, mock_supabase: MagicMock
) -> None:
    """NOTES-05.3: Note already deleted -> DELETE again -> 404."""
    mock_delete = MagicMock()
    mock_delete.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    mock_supabase.table.return_value.delete.return_value = mock_delete

    response = client.delete(
        f"/api/v1/notes/{NOTE_ID_OWNED}",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 404
