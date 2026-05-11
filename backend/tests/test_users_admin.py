"""
Tests for users admin endpoints (ADMIN-only).
"""
import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt
from passlib.context import CryptContext

from app.main import app
from app.core.config import settings
from app.core.database import get_session
from app.models.user import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture(autouse=True)
async def setup_users(test_session):
    """Create test users for admin tests."""
    admin = User(
        email="admin@test.com",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        password_hash=pwd_context.hash("admin123"),
        is_active=True,
    )
    staff = User(
        email="staff@test.com",
        first_name="Staff",
        last_name="User",
        role=UserRole.GESTOR,
        password_hash=pwd_context.hash("staff123"),
        is_active=True,
    )
    inactive = User(
        email="inactive@test.com",
        first_name="Inactive",
        last_name="User",
        role=UserRole.CLIENTE,
        password_hash=pwd_context.hash("inactive123"),
        is_active=False,
    )
    test_session.add_all([admin, staff, inactive])
    await test_session.commit()
    for u in [admin, staff, inactive]:
        await test_session.refresh(u)
    yield
    for u in [admin, staff, inactive]:
        await test_session.delete(u)
    await test_session.commit()


def _make_admin_token(sub: str, role: str) -> str:
    """Create a JWT token for testing."""
    payload = {"sub": sub, "role": role, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@pytest.fixture
async def admin_client(test_session):
    """Create test client with admin auth and session override."""
    app.state.limiter.enabled = False

    async def _override_session():
        yield test_session

    app.dependency_overrides[get_session] = _override_session
    token = _make_admin_token("1", "ADMIN")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        client.headers.update({"Authorization": f"Bearer {token}"})
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
async def gestor_client(test_session):
    """Create test client with gestor auth and session override."""
    app.state.limiter.enabled = False

    async def _override_session():
        yield test_session

    app.dependency_overrides[get_session] = _override_session
    token = _make_admin_token("2", "GESTOR")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        client.headers.update({"Authorization": f"Bearer {token}"})
        yield client

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_list_users(admin_client):
    resp = await admin_client.get("/api/v1/users")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_list_users_filter_role(admin_client):
    resp = await admin_client.get("/api/v1/users?role=GESTOR")
    assert resp.status_code == 200
    data = resp.json()
    assert all(u["role"] == "GESTOR" for u in data)


@pytest.mark.asyncio
async def test_list_users_filter_active(admin_client):
    resp = await admin_client.get("/api/v1/users?is_active=false")
    assert resp.status_code == 200
    data = resp.json()
    assert all(u["is_active"] is False for u in data)


@pytest.mark.asyncio
async def test_list_users_search(admin_client):
    resp = await admin_client.get("/api/v1/users?search=Staff")
    assert resp.status_code == 200
    data = resp.json()
    assert any("Staff" in u["first_name"] for u in data)


@pytest.mark.asyncio
async def test_get_user(admin_client):
    list_resp = await admin_client.get("/api/v1/users")
    users = list_resp.json()
    user_id = users[0]["id"]
    resp = await admin_client.get(f"/api/v1/users/{user_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id


@pytest.mark.asyncio
async def test_update_user_role(admin_client):
    list_resp = await admin_client.get("/api/v1/users?role=CLIENTE")
    users = list_resp.json()
    if users:
        user_id = users[0]["id"]
        resp = await admin_client.put(
            f"/api/v1/users/{user_id}", json={"role": "GESTOR"}
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "GESTOR"


@pytest.mark.asyncio
async def test_cannot_deactivate_self(admin_client):
    list_resp = await admin_client.get("/api/v1/users?role=ADMIN")
    admins = list_resp.json()
    admin_user = [a for a in admins if a["email"] == "admin@test.com"]
    if admin_user:
        resp = await admin_client.put(
            f"/api/v1/users/{admin_user[0]['id']}",
            json={"is_active": False},
        )
        assert resp.status_code == 400


@pytest.mark.asyncio
async def test_deactivate_user(admin_client):
    list_resp = await admin_client.get("/api/v1/users?role=CLIENTE")
    users = list_resp.json()
    if users:
        user_id = users[0]["id"]
        resp = await admin_client.delete(f"/api/v1/users/{user_id}")
        assert resp.status_code == 200
        check = await admin_client.get(f"/api/v1/users/{user_id}")
        assert check.json()["is_active"] is False


@pytest.mark.asyncio
async def test_unauthorized_access(gestor_client):
    """Non-admin users should get 403."""
    resp = await gestor_client.get("/api/v1/users")
    assert resp.status_code == 403
