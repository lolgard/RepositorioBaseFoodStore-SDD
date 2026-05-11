"""
Tests for pre-checkout validation endpoint.
Read-only: validates cart items without modifying data.
"""
import pytest
from httpx import AsyncClient


async def _register_user(
    client: AsyncClient, email: str, password: str = "SecurePass123!"
) -> dict:
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "first_name": "Test",
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


async def _get_token(client: AsyncClient, email: str) -> str:
    tokens = await _login(client, email)
    return tokens["access_token"]


async def _create_product(
    client: AsyncClient,
    token: str,
    name: str = "Test Product",
    price: str = "10.50",
    stock: int = 100,
    available: bool = True,
):
    resp = await client.post(
        "/api/v1/products",
        json={"name": name, "price": price, "stock": stock, "available": available},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _create_staff_and_login(
    client: AsyncClient, test_session, email: str = "staff-checkout@test.com"
) -> str:
    from sqlmodel import select
    from app.models.user import User, UserRole

    await _register_user(client, email)
    user = await test_session.execute(select(User).where(User.email == email))
    user_obj = user.scalar_one()
    user_obj.role = UserRole.STAFF
    await test_session.flush()
    return await _get_token(client, email)


# ###############################################################################
# Tests: Pre-checkout validation
# ###############################################################################


@pytest.mark.asyncio
async def test_validate_success(client: AsyncClient, test_session):
    """Valid cart items return no issues."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-success@test.com")
    prod_resp = await _create_product(client, staff_token, "Burger", "12.00", stock=50)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-success@test.com")
    user_token = await _get_token(client, "user-success@test.com")

    resp = await client.post(
        "/api/v1/checkout/validate",
        json={
            "items": [{"product_id": product_id, "quantity": 2}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["issues"] == []


@pytest.mark.asyncio
async def test_validate_insufficient_stock(client: AsyncClient, test_session):
    """Insufficient stock is detected."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-stock@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=3)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-stock@test.com")
    user_token = await _get_token(client, "user-stock@test.com")

    resp = await client.post(
        "/api/v1/checkout/validate",
        json={
            "items": [{"product_id": product_id, "quantity": 999}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is False
    assert len(data["issues"]) == 1
    issue = data["issues"][0]
    assert issue["type"] == "stock_changed"
    assert issue["product_id"] == product_id
    assert issue["requested"] == 999
    assert issue["available"] == 3


@pytest.mark.asyncio
async def test_validate_product_unavailable(client: AsyncClient, test_session):
    """Unavailable product is detected."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-unavail@test.com")
    prod_resp = await _create_product(client, staff_token, "Off Item", "5.00", stock=10, available=False)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-unavail@test.com")
    user_token = await _get_token(client, "user-unavail@test.com")

    resp = await client.post(
        "/api/v1/checkout/validate",
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is False
    assert len(data["issues"]) == 1
    assert data["issues"][0]["type"] == "product_unavailable"


@pytest.mark.asyncio
async def test_validate_product_not_found(client: AsyncClient, test_session):
    """Non-existent product is detected."""
    await _register_user(client, "user-notfound@test.com")
    user_token = await _get_token(client, "user-notfound@test.com")

    resp = await client.post(
        "/api/v1/checkout/validate",
        json={
            "items": [{"product_id": 99999, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is False
    assert len(data["issues"]) == 1
    assert data["issues"][0]["type"] == "product_not_found"
    assert data["issues"][0]["product_id"] == 99999


@pytest.mark.asyncio
async def test_validate_price_changed(client: AsyncClient, test_session):
    """Price change is detected when expected_price differs."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-price@test.com")
    prod_resp = await _create_product(client, staff_token, "Laptop", "1000.00", stock=5)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-price@test.com")
    user_token = await _get_token(client, "user-price@test.com")

    resp = await client.post(
        "/api/v1/checkout/validate",
        json={
            "items": [{"product_id": product_id, "quantity": 1, "expected_price": "999.99"}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is False
    assert len(data["issues"]) == 1
    issue = data["issues"][0]
    assert issue["type"] == "price_changed"
    assert issue["expected_price"] == "999.99"
    assert issue["current_price"] == "1000.00"


@pytest.mark.asyncio
async def test_validate_unauthenticated(client: AsyncClient):
    """No token returns 401."""
    resp = await client.post(
        "/api/v1/checkout/validate",
        json={"items": [{"product_id": 1, "quantity": 1}]},
    )
    assert resp.status_code == 401
