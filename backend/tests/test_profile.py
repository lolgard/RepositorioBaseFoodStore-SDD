"""
Tests for profile management (view, update, change password).
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_profile(client: AsyncClient, test_session):
    """GET /me returns correct user data."""
    await client.post("/api/v1/auth/register", json={
        "email": "profile@test.com",
        "password": "TestPass123!",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "1234567890",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "profile@test.com",
        "password": "TestPass123!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@test.com"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["phone"] == "1234567890"


@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient, test_session):
    """PUT /me updates profile fields."""
    await client.post("/api/v1/auth/register", json={
        "email": "update@test.com",
        "password": "TestPass123!",
        "first_name": "Old",
        "last_name": "Name",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "update@test.com",
        "password": "TestPass123!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.put("/api/v1/auth/me", json={
        "first_name": "New",
        "last_name": "NameUpdated",
        "phone": "9999999999",
    }, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "New"
    assert data["last_name"] == "NameUpdated"
    assert data["phone"] == "9999999999"


@pytest.mark.asyncio
async def test_update_profile_empty_body(client: AsyncClient, test_session):
    """PUT /me with empty body returns current profile unchanged."""
    await client.post("/api/v1/auth/register", json={
        "email": "empty@test.com",
        "password": "TestPass123!",
        "first_name": "Constant",
        "last_name": "User",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "empty@test.com",
        "password": "TestPass123!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.put("/api/v1/auth/me", json={}, headers=headers)
    assert response.status_code == 200
    assert response.json()["first_name"] == "Constant"


@pytest.mark.asyncio
async def test_change_password_success(client: AsyncClient, test_session):
    """PUT /me/password changes password successfully."""
    await client.post("/api/v1/auth/register", json={
        "email": "changepass@test.com",
        "password": "OldPass123!",
        "first_name": "Pass",
        "last_name": "User",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "changepass@test.com",
        "password": "OldPass123!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.put("/api/v1/auth/me/password", json={
        "current_password": "OldPass123!",
        "new_password": "NewPass123!",
    }, headers=headers)
    assert response.status_code == 200

    # Should still access with current access token
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_change_password_wrong_current(client: AsyncClient, test_session):
    """PUT /me/password with wrong current password returns 401."""
    await client.post("/api/v1/auth/register", json={
        "email": "wrongpass@test.com",
        "password": "CorrectPass1!",
        "first_name": "Wrong",
        "last_name": "Pass",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "wrongpass@test.com",
        "password": "CorrectPass1!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.put("/api/v1/auth/me/password", json={
        "current_password": "WrongPass1!",
        "new_password": "NewPass123!",
    }, headers=headers)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_change_password_weak_new(client: AsyncClient, test_session):
    """PUT /me/password with weak new password returns 422."""
    await client.post("/api/v1/auth/register", json={
        "email": "weaknew@test.com",
        "password": "StrongPass1!",
        "first_name": "Weak",
        "last_name": "New",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "weaknew@test.com",
        "password": "StrongPass1!",
    })).json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    response = await client.put("/api/v1/auth/me/password", json={
        "current_password": "StrongPass1!",
        "new_password": "short",
    }, headers=headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_profile_unauthenticated(client: AsyncClient, test_session):
    """Endpoints return 401 without token."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401

    response = await client.put("/api/v1/auth/me", json={"first_name": "Test"})
    assert response.status_code == 401

    response = await client.put("/api/v1/auth/me/password", json={
        "current_password": "x",
        "new_password": "y" * 8,
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_change_password_logs_out_other_sessions(client: AsyncClient, test_session):
    """Changing password revokes ALL refresh tokens."""
    await client.post("/api/v1/auth/register", json={
        "email": "sessions@test.com",
        "password": "OrigPass1!",
        "first_name": "Session",
        "last_name": "Test",
    })
    tokens = (await client.post("/api/v1/auth/login", json={
        "email": "sessions@test.com",
        "password": "OrigPass1!",
    })).json()
    refresh = tokens["refresh_token"]
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    # Change password
    response = await client.put("/api/v1/auth/me/password", json={
        "current_password": "OrigPass1!",
        "new_password": "NewPass123!",
    }, headers=headers)
    assert response.status_code == 200

    # Old refresh token should be revoked
    response = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh,
    })
    assert response.status_code == 401
