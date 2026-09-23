
import time
import os
import sys
import platform
from datetime import datetime, timezone
from fastapi import APIRouter, Request
from app.core.config import settings
from app.core.database import DatabaseManager
from app.core.limiter import limiter, HEALTH_API_LIMIT

router = APIRouter()

START_TIME = time.time()

def check_health_diagnostics():
    uptime_seconds = int(time.time() - START_TIME)
    
    # Check default database connectivity
    db_status = "healthy"
    db_details = {}
    try:
        schema = DatabaseManager.inspect_schema(db_type="sqlite")
        db_details = {
            "type": "sqlite",
            "connected": True,
            "tables_detected": [t["name"] for t in schema.get("tables", [])],
            "table_count": len(schema.get("tables", []))
        }
    except Exception as e:
        db_status = "degraded"
        db_details = {
            "type": "sqlite",
            "connected": False,
            "error": str(e)
        }

    overall_status = "healthy" if db_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": uptime_seconds,
        "database": {
            "status": db_status,
            **db_details
        },
        "system": {
            "platform": platform.platform(),
            "python_version": sys.version.split()[0],
            "environment": os.getenv("ENVIRONMENT", "production")
        }
    }

@router.get("", summary="Comprehensive Service Health & Readiness")
@limiter.limit(HEALTH_API_LIMIT)
def get_health_status(request: Request):
    """
    Returns comprehensive liveness and readiness health diagnostics,
    including service status, database connectivity, system metrics, and uptime.
    """
    return check_health_diagnostics()

