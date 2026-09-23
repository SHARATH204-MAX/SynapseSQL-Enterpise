from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import DatabaseManager
from app.core.security import validate_query_safety
from app.core.limiter import limiter, DATABASE_API_LIMIT

router = APIRouter()

class SchemaRequest(BaseModel):
    type: str = "sqlite"
    sqlite_path: Optional[str] = None
    mysql_host: Optional[str] = None
    mysql_user: Optional[str] = None
    mysql_password: Optional[str] = None
    mysql_db: Optional[str] = None
    mongo_uri: Optional[str] = None
    mongo_db_name: Optional[str] = None

class QueryExecuteRequest(BaseModel):
    query: str
    db_config: Dict[str, Any] = {"type": "sqlite"}
    read_only: bool = True

@router.post("/schema")
@limiter.limit(DATABASE_API_LIMIT)
def get_schema(request: Request, req: SchemaRequest):
    try:
        schema = DatabaseManager.inspect_schema(
            db_type=req.type,
            sqlite_path=req.sqlite_path,
            mysql_host=req.mysql_host,
            mysql_user=req.mysql_user,
            mysql_password=req.mysql_password,
            mysql_db=req.mysql_db,
            mongo_uri=req.mongo_uri,
            mongo_db_name=req.mongo_db_name
        )
        return schema
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Schema inspection failed: {str(e)}")

@router.post("/test-connection")
@limiter.limit(DATABASE_API_LIMIT)
def test_connection(request: Request, req: SchemaRequest):
    try:
        schema = DatabaseManager.inspect_schema(
            db_type=req.type,
            sqlite_path=req.sqlite_path,
            mysql_host=req.mysql_host,
            mysql_user=req.mysql_user,
            mysql_password=req.mysql_password,
            mysql_db=req.mysql_db,
            mongo_uri=req.mongo_uri,
            mongo_db_name=req.mongo_db_name
        )
        return {"status": "success", "tablesCount": len(schema.get("tables", []))}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/execute")
@limiter.limit(DATABASE_API_LIMIT)
def execute_query(request: Request, req: QueryExecuteRequest):
    is_safe, warn_msg = validate_query_safety(req.query, read_only=req.read_only)
    if not is_safe:
        raise HTTPException(status_code=403, detail=warn_msg)
    
    try:
        res = DatabaseManager.execute_raw_query(
            query=req.query,
            db_type=req.db_config.get("type", "sqlite"),
            sqlite_path=req.db_config.get("sqlite_path"),
            mysql_host=req.db_config.get("mysql_host"),
            mysql_user=req.db_config.get("mysql_user"),
            mysql_password=req.db_config.get("mysql_password"),
            mysql_db=req.db_config.get("mysql_db")
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Execution error: {str(e)}")
