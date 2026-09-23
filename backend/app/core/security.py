import re
from typing import Tuple

DESTRUCTIVE_KEYWORDS = [
    r"\bDROP\b",
    r"\bDELETE\b",
    r"\bTRUNCATE\b",
    r"\bALTER\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bCREATE\s+USER\b",
    r"\bDROP\s+USER\b",
    r"\bSHUTDOWN\b"
]

def validate_query_safety(query: str, read_only: bool = True) -> Tuple[bool, str]:
    """
    Validates if a SQL/MongoDB query adheres to safety guardrails.
    In read-only mode, any DDL/DML destructive keywords are blocked.
    """
    if not query or not query.strip():
        return True, ""
    
    clean_query = query.strip()
    
    if read_only:
        for pattern in DESTRUCTIVE_KEYWORDS:
            if re.search(pattern, clean_query, re.IGNORECASE):
                return False, f"Query blocked by Security Guardrails: Read-only mode active. Destructive keyword matched: {pattern}"
                
    return True, ""
