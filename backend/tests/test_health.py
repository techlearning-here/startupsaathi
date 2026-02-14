"""Tests for GET /health (AUTH-01)."""

import pytest
from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    """GET /health returns status 200."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_json_with_status(client: TestClient) -> None:
    """GET /health returns JSON with status healthy."""
    response = client.get("/health")
    data = response.json()
    assert data.get("status") == "healthy"
    assert "version" in data


def test_health_content_type_is_json(client: TestClient) -> None:
    """GET /health response is JSON."""
    response = client.get("/health")
    assert "application/json" in response.headers.get("content-type", "")
