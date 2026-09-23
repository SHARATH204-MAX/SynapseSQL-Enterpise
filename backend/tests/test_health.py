def test_root_health_check(client):
    """Test the root /health endpoint for load balancer liveness."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SynapseSQL" in data["service"]
    assert "uptime_seconds" in data
    assert data["database"]["status"] == "healthy"

def test_api_v1_health_check(client):
    """Test the detailed /api/v1/health diagnostic endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["connected"] is True
    assert "STUDENT" in data["database"]["tables_detected"]
    assert "system" in data
    assert "platform" in data["system"]
    assert "python_version" in data["system"]
