import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.main import app
from app.services.user_service import UserService
from app.core.auth import create_user_jwt

@pytest.fixture(scope="session")
def client():
    """Returns a test client for FastAPI."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="session")
def analyst_token():
    """Generates a valid JWT token for the demo analyst role."""
    user = UserService.create_or_get_demo_user(role="analyst")
    return create_user_jwt(user)

@pytest.fixture(scope="session")
def admin_token():
    """Generates a valid JWT token for the demo admin role."""
    user = UserService.create_or_get_demo_user(role="admin")
    return create_user_jwt(user)

@pytest.fixture(scope="session")
def viewer_token():
    """Generates a valid JWT token for the demo viewer role."""
    user = UserService.create_or_get_demo_user(role="viewer")
    return create_user_jwt(user)

@pytest.fixture
def auth_headers(analyst_token):
    """Returns authorization headers for an analyst."""
    return {"Authorization": f"Bearer {analyst_token}"}
