import datetime
import jwt
from typing import Optional, Dict, Any, List
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

JWT_ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)

def verify_google_credential(credential: str) -> Dict[str, Any]:
    """
    Verifies a Google ID Token (credential) using Google's public keys.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        return {
            "email": id_info.get("email"),
            "name": id_info.get("name", "Google User"),
            "avatar_url": id_info.get("picture", "")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

def create_user_jwt(user: Dict[str, Any]) -> str:
    """Creates an app session JWT valid for 7 days."""
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar_url": user.get("avatar_url", ""),
        "role": user.get("role", "analyst"),
        "exp": expire
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_user_jwt(token: str) -> Dict[str, Any]:
    # 1. Try internal JWT verification
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except Exception:
        pass

    # 2. Try Supabase JWT verification
    from app.core.supabase import get_supabase_client, SupabaseService
    client = get_supabase_client()
    if client:
        try:
            res = client.auth.get_user(token)
            if res and res.user:
                u = res.user
                meta = u.user_metadata or {}
                name = meta.get("full_name") or meta.get("name") or (u.email.split("@")[0] if u.email else "User")
                role = meta.get("role", "analyst")
                avatar = meta.get("avatar_url", "")
                
                # Auto-sync profile to Supabase user_profiles table
                SupabaseService.upsert_user_profile(
                    user_id=u.id,
                    email=u.email or "",
                    full_name=name,
                    avatar_url=avatar,
                    role=role
                )
                
                return {
                    "sub": u.id,
                    "id": u.id,
                    "email": u.email,
                    "name": name,
                    "avatar_url": avatar,
                    "role": role
                }
        except Exception:
            pass

    raise HTTPException(status_code=401, detail="Invalid session credentials. Please sign in.")


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    return decode_user_jwt(credentials.credentials)

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    if not credentials or not credentials.credentials:
        return None
    try:
        return decode_user_jwt(credentials.credentials)
    except Exception:
        return None

def require_role(allowed_roles: List[str]):
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)):
        user_role = user.get("role", "viewer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of {allowed_roles}, but your role is '{user_role}'"
            )
        return user
    return role_checker
