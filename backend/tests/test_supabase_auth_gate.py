import sys
from pathlib import Path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

import pytest
from app.core.supabase import SupabaseService


def test_auth_config(client):
    """Verifies public configuration endpoint returns Supabase settings."""
    res = client.get("/api/auth/config")
    assert res.status_code == 200
    data = res.json()
    assert "supabaseUrl" in data
    assert "supabaseAnonKey" in data
    assert "googleClientId" in data

def test_mandatory_login_gate_unauthenticated(client):
    """Verifies that unauthenticated query attempts are strictly blocked with 401."""
    res = client.post(
        "/api/chat/stream",
        json={"query": "Show all students"}
    )
    assert res.status_code == 401
    assert "Authentication required" in res.json().get("detail", "")

def test_mandatory_login_gate_authenticated(client, auth_headers):
    """Verifies that authenticated requests pass the login gate."""
    # Invalid API key triggers fast 200 stream with error payload or validation, not 401
    res = client.post(
        "/api/chat/stream",
        headers=auth_headers,
        json={"query": "Show all students"}
    )
    # The login gate was passed successfully (HTTP 200 SSE streaming response)
    assert res.status_code == 200

def test_supabase_service_graceful_logging():
    """Verifies SupabaseService logs query metadata without crashing."""
    success = SupabaseService.log_query_usage(
        user_id="test_uid_123",
        user_email="tester@test.com",
        user_name="Test User",
        query_text="SELECT 1",
        generated_sql="SELECT 1;",
        model_name="qwen/qwen3.8-27b",
        database_type="sqlite",
        status="success",
        execution_time_ms=120,
        rows_returned=1
    )
    # Even if table doesn't exist yet, service handles it safely without crashing
    assert isinstance(success, bool)
