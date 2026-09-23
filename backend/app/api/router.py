from fastapi import APIRouter
from app.api.endpoints import chat, database, export, auth, health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health & Monitoring"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat & Agent"])
api_router.include_router(database.router, prefix="/database", tags=["Database & Schema"])
api_router.include_router(export.router, prefix="/export", tags=["Export & Reporting"])
