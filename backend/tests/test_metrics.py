"""
Tests for metrics dashboard endpoints.
"""
import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from jose import jwt

from app.models.user import User, UserRole
from app.models.order import Order, OrderItem
from app.core.config import settings


async def _register_user(
    client: AsyncClient, email: str, password: str = "SecurePass123!"
) -> dict:
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "first_name": "Admin",
        "last_name": "User",
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _login(client: AsyncClient, email: str, password: str = "SecurePass123!") -> dict:
    resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


async def _create_admin(client: AsyncClient, test_session, email: str = "admin-metrics@test.com"):
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.ADMIN
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


async def _create_staff(client: AsyncClient, test_session, email: str = "staff-metrics@test.com"):
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.STAFF
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


@pytest.mark.asyncio
async def test_summary(client: AsyncClient, test_session):
    """GET /api/v1/admin/metrics/summary returns summary data."""
    token = await _create_admin(client, test_session, "admin-metrics-s@test.com")
    resp = await client.get(
        "/api/v1/admin/metrics/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "total_orders" in data
    assert "total_revenue" in data
    assert "average_order_value" in data
    assert isinstance(data["total_users"], int)
    assert isinstance(data["total_revenue"], float)


@pytest.mark.asyncio
async def test_sales_evolution(client: AsyncClient, test_session):
    """GET /api/v1/admin/metrics/sales-evolution returns list."""
    token = await _create_admin(client, test_session, "admin-metrics-se@test.com")
    resp = await client.get(
        "/api/v1/admin/metrics/sales-evolution?days=7",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_top_products(client: AsyncClient, test_session):
    """GET /api/v1/admin/metrics/top-products returns list."""
    token = await _create_admin(client, test_session, "admin-metrics-tp@test.com")
    resp = await client.get(
        "/api/v1/admin/metrics/top-products?limit=5",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_orders_by_status(client: AsyncClient, test_session):
    """GET /api/v1/admin/metrics/orders-by-status returns list."""
    token = await _create_admin(client, test_session, "admin-metrics-os@test.com")
    resp = await client.get(
        "/api/v1/admin/metrics/orders-by-status",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_unauthorized(client: AsyncClient, test_session):
    """Non-admin users get 403."""
    token = await _create_staff(client, test_session, "staff-metrics-unauth@test.com")
    resp = await client.get(
        "/api/v1/admin/metrics/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated(client: AsyncClient):
    """Unauthenticated requests get 401."""
    resp = await client.get("/api/v1/admin/metrics/summary")
    assert resp.status_code == 401
