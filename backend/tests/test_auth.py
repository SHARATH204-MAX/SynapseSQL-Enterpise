def test_demo_login_analyst(client):
    """Test demo login with analyst role."""
    response = client.post("/api/v1/auth/demo-login", json={"role": "analyst"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "token" in data
    assert data["user"]["role"] == "analyst"
    assert "synapsesql.enterprise" in data["user"]["email"]

def test_demo_login_admin(client):
    """Test demo login with admin role."""
    response = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["role"] == "admin"

def test_auth_me_with_valid_token(client, analyst_token):
    """Test accessing /me endpoint with valid Bearer token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "authenticated"
    assert data["user"]["role"] == "analyst"

def test_auth_me_unauthorized(client):
    """Test accessing /me endpoint without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_logout(client):
    """Test logout endpoint."""
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["status"] == "logged_out"
