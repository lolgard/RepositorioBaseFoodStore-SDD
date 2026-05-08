"""
Tests for auth endpoints: register, login, refresh, logout, me.
"""
import pytest
from httpx import AsyncClient


# ─── /api/v1/auth/register ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    """Register a new user successfully."""
    payload = {
        "email": "nuevo@test.com",
        "password": "SecurePass123!",
        "first_name": "Nuevo",
        "last_name": "Usuario",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["message"] == "Registration successful"
    assert data["user"]["email"] == "nuevo@test.com"
    assert data["user"]["first_name"] == "Nuevo"
    assert "id" in data["user"]
    assert data["user"]["role"] == "CLIENTE"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Registering with an email that already exists returns 409."""
    payload = {
        "email": "duplicado@test.com",
        "password": "SecurePass123!",
        "first_name": "First",
        "last_name": "User",
    }
    # First one succeeds
    resp1 = await client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    # Second one should fail
    resp2 = await client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409, resp2.text


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    """Password that doesn't meet strength requirements returns 422."""
    payload = {
        "email": "weak@test.com",
        "password": "123",  # too short
        "first_name": "Weak",
        "last_name": "Pass",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422, response.text


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    """Invalid email format returns 422."""
    payload = {
        "email": "not-an-email",
        "password": "SecurePass123!",
        "first_name": "Bad",
        "last_name": "Email",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422, response.text


# ─── /api/v1/auth/login ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Login with valid credentials returns access and refresh tokens."""
    # First register a user
    email = "login-test@test.com"
    register_payload = {
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Login",
        "last_name": "Test",
    }
    reg_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_resp.status_code == 201

    # Now login
    login_payload = {"email": email, "password": "SecurePass123!"}
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "CLIENTE"
    # Verify access token is not the same as refresh
    assert data["access_token"] != data["refresh_token"]


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Login with wrong password returns 401."""
    # First register a user
    email = "wrong-pass@test.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Wrong",
        "last_name": "Pass",
    })

    # Login with wrong password
    response = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword!",
    })
    assert response.status_code == 401, response.text
    data = response.json()
    assert "title" in data  # RFC 7807


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Login with non-existent email returns 401."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "no-existe@test.com",
        "password": "AnyPass123!",
    })
    assert response.status_code == 401, response.text


# ─── /api/v1/auth/refresh ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_success(client: AsyncClient):
    """Refresh a valid refresh token returns a new token pair."""
    # Register and login
    email = "refresh-test@test.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Refresh",
        "last_name": "Test",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "SecurePass123!",
    })
    refresh_token = login_resp.json()["refresh_token"]

    # Use the refresh token
    response = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # Token should be rotated (different from previous)
    assert data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_refresh_reuse_detection(client: AsyncClient):
    """
    Using an already-used refresh token (after rotation) should
    revoke all tokens for that user and require re-login.
    """
    email = "reuse-test@test.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Reuse",
        "last_name": "Test",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "SecurePass123!",
    })
    first_refresh = login_resp.json()["refresh_token"]

    # First refresh is fine
    resp1 = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": first_refresh,
    })
    assert resp1.status_code == 200

    # Using the SAME refresh token again (already rotated) should fail
    resp2 = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": first_refresh,
    })
    # Theft detected — should be 401
    assert resp2.status_code == 401, resp2.text

    # Even the new refresh token from the first rotation should now be revoked
    second_refresh = resp1.json()["refresh_token"]
    resp3 = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": second_refresh,
    })
    assert resp3.status_code == 401, resp3.text


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    """Invalid refresh token returns 401."""
    response = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": "invalid-token-here",
    })
    assert response.status_code == 401, response.text


# ─── /api/v1/auth/logout ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_logout_revokes_refresh(client: AsyncClient):
    """Logout should revoke the refresh token."""
    email = "logout-test@test.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Logout",
        "last_name": "Test",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "SecurePass123!",
    })
    data = login_resp.json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    # Logout
    response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200, response.text

    # Using the same refresh token should now fail
    resp2 = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token,
    })
    assert resp2.status_code == 401, resp2.text


# ─── /api/v1/auth/me ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_me_authenticated(client: AsyncClient):
    """GET /api/v1/auth/me returns the authenticated user."""
    email = "me-test@test.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePass123!",
        "first_name": "Me",
        "last_name": "Test",
    })
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "SecurePass123!",
    })
    access_token = login_resp.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == email
    assert data["first_name"] == "Me"


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    """GET /api/v1/auth/me without a token returns 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401, response.text
