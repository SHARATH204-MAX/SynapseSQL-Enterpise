from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.auth import verify_google_credential, create_user_jwt, get_current_user, get_optional_user
from app.services.user_service import UserService
from app.core.limiter import limiter, AUTH_API_LIMIT

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    credential: str

class DemoLoginRequest(BaseModel):
    role: str = "analyst"  # "admin" | "analyst" | "viewer"

from app.core.config import settings
from app.core.supabase import SupabaseService

@router.get("/config")
def get_public_auth_config():
    """Returns public client configuration for Supabase and Google OAuth."""
    return {
        "supabaseUrl": settings.SUPABASE_URL,
        "supabaseAnonKey": settings.SUPABASE_ANON_KEY,
        "googleClientId": settings.GOOGLE_CLIENT_ID
    }

@router.post("/google")
@limiter.limit(AUTH_API_LIMIT)
def google_sign_in(request: Request, req: GoogleAuthRequest):
    # 1. Verify Google ID token
    google_data = verify_google_credential(req.credential)
    
    # 2. Upsert user in database
    user = UserService.upsert_google_user(
        email=google_data["email"],
        name=google_data["name"],
        avatar_url=google_data.get("avatar_url")
    )
    
    # 3. Also sync to Supabase
    SupabaseService.upsert_user_profile(
        user_id=user["id"],
        email=user["email"],
        full_name=user["name"],
        avatar_url=user.get("avatar_url"),
        role=user.get("role", "analyst")
    )
    
    # 4. Create Session JWT
    token = create_user_jwt(user)
    
    return {
        "status": "success",
        "token": token,
        "user": user
    }

@router.post("/demo-login")
@limiter.limit(AUTH_API_LIMIT)
def demo_login(request: Request, req: DemoLoginRequest):
    valid_roles = ["admin", "analyst", "viewer"]
    role = req.role.lower() if req.role.lower() in valid_roles else "analyst"
    
    user = UserService.create_or_get_demo_user(role=role)
    
    # Sync demo user to Supabase
    SupabaseService.upsert_user_profile(
        user_id=user["id"],
        email=user["email"],
        full_name=user["name"],
        avatar_url=user.get("avatar_url"),
        role=user.get("role", "analyst")
    )
    
    token = create_user_jwt(user)
    
    return {
        "status": "success",
        "token": token,
        "user": user
    }

@router.get("/me")
def get_current_profile(user: Dict[str, Any] = Depends(get_current_user)):
    user = {**user, "id": user.get("id", user.get("sub"))}
    return {
        "status": "authenticated",
        "user": user
    }

@router.get("/history")
def get_user_history(user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches past queries executed by the authenticated user from Supabase."""
    user_id = user.get("id", user.get("sub"))
    logs = SupabaseService.get_user_logs(user_id=str(user_id), limit=30)
    return {
        "status": "success",
        "logs": logs
    }

@router.post("/logout")
def logout():
    return {"status": "logged_out", "message": "Session terminated."}

