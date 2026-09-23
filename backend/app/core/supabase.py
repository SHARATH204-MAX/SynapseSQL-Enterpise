import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("synapsesql.supabase")

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """Returns the singleton Supabase admin client initialized with service role key."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

    if not url or not key:
        return None

    try:
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}")
        return None


class SupabaseService:
    """Handles persistence of user profiles and model query interaction logs to Supabase."""

    @classmethod
    def upsert_user_profile(
        cls,
        user_id: str,
        email: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        role: str = "analyst"
    ) -> bool:
        client = get_supabase_client()
        if not client:
            return False

        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            data = {
                "id": str(user_id),
                "email": email,
                "full_name": full_name or email.split("@")[0],
                "avatar_url": avatar_url,
                "role": role,
                "last_sign_in_at": now_iso
            }
            # Upsert into public.user_profiles
            client.table("user_profiles").upsert(data).execute()
            return True
        except Exception as e:
            logger.warning(f"Supabase user_profiles upsert skipped/failed: {e}")
            return False

    @classmethod
    def log_query_usage(
        cls,
        user_id: Optional[str],
        user_email: Optional[str],
        user_name: Optional[str],
        query_text: str,
        generated_sql: Optional[str],
        model_name: str,
        database_type: str = "sqlite",
        status: str = "success",
        execution_time_ms: int = 0,
        rows_returned: int = 0,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Persists query metadata and formulated SQL into public.query_logs.
        Strictly excludes raw database records to protect user data privacy.
        """
        client = get_supabase_client()
        if not client:
            return False

        try:
            payload = {
                "user_id": str(user_id) if user_id else None,
                "user_email": user_email or "anonymous",
                "user_name": user_name or "Anonymous User",
                "query_text": query_text,
                "generated_sql": generated_sql,
                "model_name": model_name,
                "database_type": database_type,
                "status": status,
                "execution_time_ms": execution_time_ms,
                "rows_returned": rows_returned,
                "error_message": error_message[:500] if error_message else None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            client.table("query_logs").insert(payload).execute()
            return True
        except Exception as e:
            logger.warning(f"Supabase query_logs insertion skipped/failed: {e}")
            return False

    @classmethod
    def get_user_logs(cls, user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if not client:
            return []

        try:
            res = (
                client.table("query_logs")
                .select("*")
                .eq("user_id", str(user_id))
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return res.data or []
        except Exception as e:
            logger.warning(f"Supabase get_user_logs failed: {e}")
            return []
