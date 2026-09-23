def test_schema_inspection(client):
    """Test schema inspection on default SQLite student database."""
    response = client.post("/api/v1/database/schema", json={"type": "sqlite"})
    assert response.status_code == 200
    data = response.json()
    assert "tables" in data
    table_names = [t["name"] for t in data["tables"]]
    assert "STUDENT" in table_names
    assert "DEPARTMENTS" in table_names

def test_test_connection(client):
    """Test database connection ping."""
    response = client.post("/api/v1/database/test-connection", json={"type": "sqlite"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["tablesCount"] >= 2

def test_execute_safe_query(client):
    """Test executing a safe SELECT query returns rows and columns."""
    response = client.post(
        "/api/v1/database/execute",
        json={
            "query": "SELECT NAME, MARKS FROM STUDENT ORDER BY MARKS DESC LIMIT 3;",
            "db_config": {"type": "sqlite"},
            "read_only": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert "rows" in data
    assert data["columns"] == ["NAME", "MARKS"]
    assert len(data["rows"]) == 3

def test_execute_destructive_query_blocked(client):
    """Test that destructive queries (DROP TABLE) are blocked by read-only guardrails."""
    response = client.post(
        "/api/v1/database/execute",
        json={
            "query": "DROP TABLE STUDENT;",
            "db_config": {"type": "sqlite"},
            "read_only": True
        }
    )
    assert response.status_code == 403
    assert "Query blocked by Security Guardrails" in response.json()["detail"]
