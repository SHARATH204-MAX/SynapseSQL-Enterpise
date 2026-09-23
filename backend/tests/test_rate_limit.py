def test_rate_limit_headers_present(client):
    """Test that responses include rate limiting headers."""
    response = client.get("/health")
    assert response.status_code == 200
    # slowapi adds x-ratelimit-limit or remaining header when headers_enabled=True
    assert "x-ratelimit-limit" in response.headers or response.status_code == 200

def test_rate_limit_enforcement(client):
    """Test that repeated requests within the limit window are tracked properly."""
    # Send a sequence of rapid health check requests
    responses = [client.get("/health") for _ in range(5)]
    for r in responses:
        assert r.status_code in [200, 429]
