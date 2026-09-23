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
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "synapsesql-enterprise-secret-jwt-key-2026-production")
    
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

settings = Settings()
