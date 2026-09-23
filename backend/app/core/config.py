import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load root or local .env
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "MAJOR_PROJECT" / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "SynapseSQL Enterprise API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv(
        "GOOGLE_CLIENT_ID",
        "243618861510-vlht74a0dj2a2tgoit8n4e0v12pse2oq.apps.googleusercontent.com"
    )

    # Session signing key. Deliberately has NO fallback default: a hardcoded
    # secret that ships in source control lets anyone forge admin tokens.
    # startup_check() below enforces that it is present, non-trivial, and not a
    # previously-leaked value before the app begins serving requests.
    # _validate_jwt_secret() below enforces this at import time.
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")

    # Secrets that have ever appeared in source control / public docs.
    # These must never be accepted for signing.
    LEAKED_SECRETS: set[str] = {
        "synapsesql-enterprise-secret-jwt-key-2026-production",
    }
    MIN_JWT_SECRET_LENGTH: int = 32
    
    DEFAULT_SQLITE_PATH: str = str((Path(__file__).resolve().parent.parent.parent / "data" / "student.db").resolve())
    AUTH_DB_PATH: str = str((Path(__file__).resolve().parent.parent.parent / "data" / "auth.db").resolve())
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    READ_ONLY_DEFAULT: bool = True


def _validate_jwt_secret(secret: str) -> str:
    """
    Fail fast on a missing, weak, or previously-leaked JWT signing key.

    Raising at import time is intentional: the alternative is silently signing
    sessions with a publicly known key, which would let anyone mint an admin
    token for this deployment.
    """
    candidate = (secret or "").strip()

    if not candidate:
        raise RuntimeError(
            "JWT_SECRET_KEY is not set. Refusing to start with an unsigned/known "
            "session secret.\n"
            "  Fix: generate one and add it to MAJOR_PROJECT/.env\n"
            '    python -c "import secrets; print(secrets.token_urlsafe(48))"\n'
            "  Then: JWT_SECRET_KEY=\"<the generated value>\""
        )

    if candidate in settings.LEAKED_SECRETS:
        raise RuntimeError(
            "JWT_SECRET_KEY matches a secret that has been committed to source "
            "control and must be considered public. Refusing to start.\n"
            "  Fix: generate a new value and update MAJOR_PROJECT/.env\n"
            '    python -c "import secrets; print(secrets.token_urlsafe(48))"'
        )

    if len(candidate) < settings.MIN_JWT_SECRET_LENGTH:
        raise RuntimeError(
            f"JWT_SECRET_KEY is too short ({len(candidate)} chars); "
            f"minimum is {settings.MIN_JWT_SECRET_LENGTH}. Refusing to start."
        )

    return candidate


settings = Settings()

# Validate eagerly so a bad secret fails at boot, not at first login.
settings.JWT_SECRET_KEY = _validate_jwt_secret(settings.JWT_SECRET_KEY)
