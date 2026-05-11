"""
Tests for system configuration endpoints.
"""
import pytest
from httpx import AsyncClient

from app.models.user import User, UserRole
from app.models.system_config import SystemConfig


@pytest.fixture(autouse=True)
async def setup_configs(test_session):
    """Create test configs before each test."""
    configs = [
        SystemConfig(key="store_name", value="Test Store", description="Store name"),
        SystemConfig(key="delivery_fee", value="10.00", description="Delivery fee"),
    ]
    test_session.add_all(configs)
    await test_session.commit()


async def _register_user(
    client: AsyncClient, email: str, password: str = "SecurePass123!"
) -> dict:
    """Register a user via API."""
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "first_name": "Admin",
        "last_name": "User",
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _login(client: AsyncClient, email: str, password: str = "SecurePass123!") -> dict:
    """Login and return token data."""
    resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


async def _create_admin(client: AsyncClient, test_session, email: str = "admin@test.com"):
    """Create an ADMIN user and return access_token."""
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.ADMIN
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


async def _create_staff(client: AsyncClient, test_session, email: str = "staff@test.com"):
    """Create a STAFF user and return access_token."""
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.STAFF
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


@pytest.mark.asyncio
async def test_list_configs(client: AsyncClient, test_session):
    """Admin can list all configs."""
    token = await _create_admin(client, test_session)
    resp = await client.get(
        "/api/v1/admin/config/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    keys = {c["key"] for c in data}
    assert "store_name" in keys
    assert "delivery_fee" in keys


@pytest.mark.asyncio
async def test_update_config(client: AsyncClient, test_session):
    """Admin can update an existing config."""
    token = await _create_admin(client, test_session)
    resp = await client.put(
        "/api/v1/admin/config/store_name",
        json={"value": "New Store"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["value"] == "New Store"
    assert resp.json()["key"] == "store_name"


@pytest.mark.asyncio
async def test_update_creates_new_key(client: AsyncClient, test_session):
    """Updating a non-existent key auto-creates it."""
    token = await _create_admin(client, test_session)
    resp = await client.put(
        "/api/v1/admin/config/new_key",
        json={"value": "new_value"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["key"] == "new_key"
    assert resp.json()["value"] == "new_value"


@pytest.mark.asyncio
async def test_unauthorized(client: AsyncClient, test_session):
    """Non-admin users get 403."""
    token = await _create_staff(client, test_session)
    resp = await client.get(
        "/api/v1/admin/config/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated(client: AsyncClient):
    """Unauthenticated requests get 401."""
    resp = await client.get("/api/v1/admin/config/")
    assert resp.status_code == 401
