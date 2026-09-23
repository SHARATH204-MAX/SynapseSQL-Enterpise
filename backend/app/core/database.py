import os
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy import create_engine, inspect, text
from langchain_community.utilities import SQLDatabase
from app.core.config import settings

class DatabaseManager:
    """Manages database connections, schemas, and direct execution."""
    
    @staticmethod
    def get_sql_database(
        db_type: str = "sqlite",
        sqlite_path: Optional[str] = None,
        mysql_host: Optional[str] = None,
        mysql_user: Optional[str] = None,
        mysql_password: Optional[str] = None,
        mysql_db: Optional[str] = None,
        mysql_port: int = 3306
    ) -> SQLDatabase:
        if db_type == "sqlite":
            path = sqlite_path or settings.DEFAULT_SQLITE_PATH
            creator = lambda: sqlite3.connect(f"file:{path}?mode=ro", uri=True, check_same_thread=False)
            engine = create_engine("sqlite:///", creator=creator)
            return SQLDatabase(engine)
        elif db_type == "mysql":
            uri = f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"
            engine = create_engine(uri)
            return SQLDatabase(engine)
        else:
            raise ValueError(f"Unsupported SQL DB type: {db_type}")

    @staticmethod
    def inspect_schema(
        db_type: str = "sqlite",
        sqlite_path: Optional[str] = None,
        mysql_host: Optional[str] = None,
        mysql_user: Optional[str] = None,
        mysql_password: Optional[str] = None,
        mysql_db: Optional[str] = None,
        mongo_uri: Optional[str] = None,
        mongo_db_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Returns deep structural schema including tables, columns, types, sample data, and row counts."""
        if db_type == "mongodb":
            if not mongo_uri or not mongo_db_name:
                raise ValueError("MongoDB URI and DB Name required")
            from pymongo import MongoClient
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            db = client[mongo_db_name]
            collections_data = []
            for col_name in db.list_collection_names():
                count = db[col_name].count_documents({})
                samples = list(db[col_name].find({}, {"_id": 0}).limit(5))
                # deduce fields from sample
                fields = []
                if samples:
                    for k, v in samples[0].items():
                        fields.append({"name": k, "type": type(v).__name__})
                collections_data.append({
                    "name": col_name,
                    "rowCount": count,
                    "columns": fields,
                    "sampleData": samples
                })
            return {"type": "mongodb", "database": mongo_db_name, "tables": collections_data}

        # SQL Inspection (SQLite / MySQL)
        if db_type == "sqlite":
            path = sqlite_path or settings.DEFAULT_SQLITE_PATH
            engine = create_engine(f"sqlite:///{path}")
        else:
            uri = f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
            engine = create_engine(uri)

        inspector = inspect(engine)
        tables_data = []
        with engine.connect() as conn:
            for table_name in inspector.get_table_names():
                cols = inspector.get_columns(table_name)
                formatted_cols = [
                    {
                        "name": c["name"],
                        "type": str(c["type"]),
                        "nullable": c.get("nullable", True),
                        "primaryKey": bool(c.get("primary_key", False))
                    }
                    for c in cols
                ]
                # Row count
                try:
                    count_res = conn.execute(text(f"SELECT COUNT(*) FROM \"{table_name}\"")).scalar()
                except Exception:
                    count_res = 0

                # Sample 5 rows
                try:
                    sample_res = conn.execute(text(f"SELECT * FROM \"{table_name}\" LIMIT 5"))
                    keys = sample_res.keys()
                    sample_rows = [dict(zip(keys, row)) for row in sample_res.fetchall()]
                except Exception:
                    sample_rows = []

                # Foreign Keys
                fks = inspector.get_foreign_keys(table_name)
                formatted_fks = [
                    {
                        "constrained_columns": fk.get("constrained_columns"),
                        "referred_table": fk.get("referred_table"),
                        "referred_columns": fk.get("referred_columns")
                    }
                    for fk in fks
                ]

                tables_data.append({
                    "name": table_name,
                    "rowCount": count_res,
                    "columns": formatted_cols,
                    "foreignKeys": formatted_fks,
                    "sampleData": sample_rows
                })

        return {
            "type": db_type,
            "database": "student.db" if db_type == "sqlite" else mysql_db,
            "tables": tables_data
        }

    @staticmethod
    def execute_raw_query(
        query: str,
        db_type: str = "sqlite",
        sqlite_path: Optional[str] = None,
        mysql_host: Optional[str] = None,
        mysql_user: Optional[str] = None,
        mysql_password: Optional[str] = None,
        mysql_db: Optional[str] = None
    ) -> Dict[str, Any]:
        """Safely executes a read-only or verified SQL query and returns column headers and rows."""
        if db_type == "sqlite":
            path = sqlite_path or settings.DEFAULT_SQLITE_PATH
            engine = create_engine(f"sqlite:///{path}")
        else:
            uri = f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"
            engine = create_engine(uri)

        with engine.connect() as conn:
            result = conn.execute(text(query))
            if result.returns_rows:
                columns = list(result.keys())
                rows = [list(row) for row in result.fetchall()]
                return {
                    "columns": columns,
                    "rows": rows,
                    "rowCount": len(rows)
                }
            else:
                conn.commit()
                return {
                    "columns": [],
                    "rows": [],
                    "rowCount": result.rowcount,
                    "message": "Query executed successfully."
                }
