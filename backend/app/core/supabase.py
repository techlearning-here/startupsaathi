"""Supabase client for server-side DB and Storage."""

from supabase import Client, create_client

from app.config import settings

_cached: Client | None = None


def get_supabase_client() -> Client:
    """Return a singleton Supabase client. Requires SUPABASE_URL and SUPABASE_KEY."""
    global _cached
    if _cached is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
        _cached = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _cached
