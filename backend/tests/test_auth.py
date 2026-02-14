"""Tests for JWT validation and protected route (AUTH-02)."""

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.config import settings

TEST_JWT_SECRET = "test-jwt-secret-for-auth02"
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
    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
    )


@pytest.fixture
def valid_token() -> str:
    """Valid JWT with test user."""
    return _make_token(secret=TEST_JWT_SECRET)


@pytest.fixture(autouse=True)
def patch_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    """Use test secret so we can create valid tokens in tests."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)


def test_protected_endpoint_no_token_returns_401(client: TestClient) -> None:
    """AUTH-02.1: No token in request -> 401 Unauthorized."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_protected_endpoint_invalid_token_returns_401(client: TestClient) -> None:
    """AUTH-02.2: Invalid or expired token -> 401 Unauthorized."""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


def test_protected_endpoint_valid_token_returns_200(
    client: TestClient, valid_token: str
) -> None:
    """AUTH-02.3: Valid Supabase JWT -> request allowed, user_id available."""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("id") == TEST_USER_ID
    assert data.get("email") == TEST_EMAIL


def test_users_me_returns_current_user_info(
    client: TestClient, valid_token: str
) -> None:
    """AUTH-02.4: GET /api/v1/users/me with valid token -> 200 and user info."""
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert data["id"] == TEST_USER_ID
    assert data["email"] == TEST_EMAIL
