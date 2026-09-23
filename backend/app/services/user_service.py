import sqlite3
import datetime
import uuid
from typing import Optional, Dict, Any, List
from app.core.config import settings

class UserService:
    """Manages internal user accounts, roles, and permissions in SQLite auth.db"""

    @staticmethod
    def _get_connection():
        conn = sqlite3.connect(settings.AUTH_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @classmethod
    def init_db(cls):
        with cls._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                role TEXT DEFAULT 'analyst',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action TEXT,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            conn.commit()

    @classmethod
    def upsert_google_user(cls, email: str, name: str, avatar_url: Optional[str] = None) -> Dict[str, Any]:
        cls.init_db()
        now = datetime.datetime.utcnow().isoformat()
        with cls._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            existing = cursor.fetchone()

            if existing:
                cursor.execute("""
                UPDATE users SET name = ?, avatar_url = ?, last_login = ?
                WHERE email = ?
                """, (name, avatar_url, now, email))
                conn.commit()
                return {
                    "id": existing["id"],
                    "email": existing["email"],
                    "name": name,
                    "avatar_url": avatar_url,
                    "role": existing["role"]
                }
            else:
                user_id = f"usr_{uuid.uuid4().hex[:12]}"
                # First registered user becomes admin, others are analysts
                cursor.execute("SELECT COUNT(*) as cnt FROM users")
                cnt = cursor.fetchone()["cnt"]
                role = "admin" if cnt == 0 else "analyst"

                cursor.execute("""
                INSERT INTO users (id, email, name, avatar_url, role, last_login)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, email, name, avatar_url, role, now))
                conn.commit()
                return {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "avatar_url": avatar_url,
                    "role": role
                }

    @classmethod
    def create_or_get_demo_user(cls, role: str = "analyst") -> Dict[str, Any]:
        cls.init_db()
        email = f"demo.{role}@synapsesql.enterprise"
        name = f"Demo {role.capitalize()}"
        avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={role}"
        now = datetime.datetime.utcnow().isoformat()

        with cls._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            existing = cursor.fetchone()

            if existing:
                cursor.execute("UPDATE users SET last_login = ? WHERE email = ?", (now, email))
                conn.commit()
                return {
                    "id": existing["id"],
                    "email": existing["email"],
                    "name": existing["name"],
                    "avatar_url": existing["avatar_url"],
                    "role": role
                }
            else:
                user_id = f"demo_{role}_{uuid.uuid4().hex[:6]}"
                cursor.execute("""
                INSERT INTO users (id, email, name, avatar_url, role, last_login)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, email, name, avatar_url, role, now))
                conn.commit()
                return {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "avatar_url": avatar_url,
                    "role": role
                }

    @classmethod
    def get_user_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        cls.init_db()
        with cls._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
