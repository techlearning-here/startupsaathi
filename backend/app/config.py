"""Application settings loaded from environment."""

from pathlib import Path

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env from backend directory so env vars are available to Settings and other code
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings(BaseSettings):
    """App config. Required Supabase vars only when using auth/DB."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DEBUG: bool = False
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    @field_validator("SUPABASE_JWT_SECRET", mode="before")
    @classmethod
    def strip_jwt_secret(cls, v: str) -> str:
        """Strip whitespace so pasted secrets with newlines don't cause 401."""
        return v.strip() if isinstance(v, str) else v


settings = Settings()
