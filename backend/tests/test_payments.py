"""Tests for MercadoPago payment endpoints."""
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock, Mock
from sqlmodel import select
from app.models.user import User, UserRole
from app.models.order import Order


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


async def _create_staff_and_login(
    client: AsyncClient, test_session, email: str = "staff-pay@test.com"
) -> str:
    await _register_user(client, email)
    user = await test_session.execute(select(User).where(User.email == email))
    user_obj = user.scalar_one()
    user_obj.role = UserRole.STAFF
    await test_session.flush()
    return await _get_token(client, email)


async def _create_product(
    client: AsyncClient,
    token: str,
    name: str = "Test Product",
    price: str = "10.50",
    stock: int = 100,
):
    resp = await client.post(
        "/api/v1/products",
        json={"name": name, "price": price, "stock": stock, "available": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _create_address(client: AsyncClient, token: str):
    resp = await client.post(
        "/api/v1/addresses/",
        json={
            "street": "Av. Siempre Viva",
            "street_number": "742",
            "city": "Springfield",
            "state": "BSAS",
            "zip_code": "1234",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _create_order(client: AsyncClient, token: str, product_id: int, address_id: int) -> dict:
    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 2}],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def _mock_async_client(mock_class, post_return=None, get_return=None):
    """Configure an httpx.AsyncClient mock with optional post/get return values."""
    instance = AsyncMock()
    mock_class.return_value.__aenter__.return_value = instance
    if post_return:
        instance.post = AsyncMock(return_value=post_return)
    if get_return:
        instance.get = AsyncMock(return_value=get_return)
    return instance


MOCK_PREFERENCE_RESPONSE = {
    "id": "pref_test123",
    "init_point": "https://www.mercadopago.com.ar/checkout?pref_id=pref_test123",
}

MOCK_PAYMENT_RESPONSE = {
    "id": 12345678,
    "external_reference": "1",
    "status": "approved",
    "status_detail": "accredited",
    "payer": {"email": "buyer@test.com"},
}


# ###############################################################################
# Tests: Create Preference
# ###############################################################################


@pytest.mark.asyncio
async def test_create_preference_success(client: AsyncClient, test_session):
    """Successfully create a MercadoPago preference."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-cp@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-cp@test.com")
    user_token = await _get_token(client, "user-cp@test.com")
    addr_resp = await _create_address(client, user_token)
    address_id = addr_resp.json()["id"]

    order = await _create_order(client, user_token, product_id, address_id)
    order_id = order["id"]

    with patch("httpx.AsyncClient") as mock_cls:
        mock_post_resp = Mock()
        mock_post_resp.status_code = 201
        mock_post_resp.json = Mock(return_value=MOCK_PREFERENCE_RESPONSE)
        _mock_async_client(mock_cls, post_return=mock_post_resp)

        resp = await client.post(
            "/api/v1/payments/create-preference",
            json={"order_id": order_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )

    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["preference_id"] == "pref_test123"
    assert data["init_point"] == "https://www.mercadopago.com.ar/checkout?pref_id=pref_test123"
    assert data["order_id"] == order_id


@pytest.mark.asyncio
async def test_create_preference_order_not_pending(client: AsyncClient, test_session):
    """Reject preference for non-PENDING order."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-np@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-np@test.com")
    user_token = await _get_token(client, "user-np@test.com")
    addr_resp = await _create_address(client, user_token)
    address_id = addr_resp.json()["id"]

    order = await _create_order(client, user_token, product_id, address_id)
    order_id = order["id"]

    # Change order status to PROCESSING
    order_obj = await test_session.execute(select(Order).where(Order.id == order_id))
    db_order = order_obj.scalar_one()
    db_order.status = "PROCESSING"
    await test_session.flush()

    resp = await client.post(
        "/api/v1/payments/create-preference",
        json={"order_id": order_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_create_preference_other_users_order(client: AsyncClient, test_session):
    """Reject preference for another user's order."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-oth@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    product_id = prod_resp.json()["id"]

    await _register_user(client, "owner@test.com")
    owner_token = await _get_token(client, "owner@test.com")
    addr_resp = await _create_address(client, owner_token)
    address_id = addr_resp.json()["id"]

    order = await _create_order(client, owner_token, product_id, address_id)
    order_id = order["id"]

    await _register_user(client, "other@test.com")
    other_token = await _get_token(client, "other@test.com")

    resp = await client.post(
        "/api/v1/payments/create-preference",
        json={"order_id": order_id},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Webhook
# ###############################################################################


@pytest.mark.asyncio
async def test_webhook_processes_approved_payment(client: AsyncClient, test_session):
    """Webhook processes an approved payment and updates status."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-wh@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-wh@test.com")
    user_token = await _get_token(client, "user-wh@test.com")
    addr_resp = await _create_address(client, user_token)
    address_id = addr_resp.json()["id"]

    order = await _create_order(client, user_token, product_id, address_id)
    order_id = order["id"]

    # Create a payment record first
    with patch("httpx.AsyncClient") as mock_cls:
        mock_post_resp = Mock()
        mock_post_resp.status_code = 201
        mock_post_resp.json = Mock(return_value=MOCK_PREFERENCE_RESPONSE)
        _mock_async_client(mock_cls, post_return=mock_post_resp)

        await client.post(
            "/api/v1/payments/create-preference",
            json={"order_id": order_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )

    # Simulate webhook
    with patch("httpx.AsyncClient") as mock_cls:
        mock_get_resp = Mock()
        mock_get_resp.status_code = 200
        mock_get_resp.json = Mock(return_value=MOCK_PAYMENT_RESPONSE)
        _mock_async_client(mock_cls, get_return=mock_get_resp)

        resp = await client.post(
            "/api/v1/payments/webhook",
            json={"type": "payment", "data": {"id": "12345678"}},
        )

    assert resp.status_code == 200
    assert resp.json() == {"message": "OK"}

    # Verify status was updated
    status_resp = await client.get(
        f"/api/v1/payments/{order_id}/status",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert data["status"] == "approved"


# ###############################################################################
# Tests: Get Payment Status
# ###############################################################################


@pytest.mark.asyncio
async def test_get_payment_status_success(client: AsyncClient, test_session):
    """Get payment status returns correct data."""
    staff_token = await _create_staff_and_login(client, test_session, "staff-st@test.com")
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    product_id = prod_resp.json()["id"]

    await _register_user(client, "user-st@test.com")
    user_token = await _get_token(client, "user-st@test.com")
    addr_resp = await _create_address(client, user_token)
    address_id = addr_resp.json()["id"]

    order = await _create_order(client, user_token, product_id, address_id)
    order_id = order["id"]

    with patch("httpx.AsyncClient") as mock_cls:
        mock_post_resp = Mock()
        mock_post_resp.status_code = 201
        mock_post_resp.json = Mock(return_value=MOCK_PREFERENCE_RESPONSE)
        _mock_async_client(mock_cls, post_return=mock_post_resp)

        await client.post(
            "/api/v1/payments/create-preference",
            json={"order_id": order_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )

    resp = await client.get(
        f"/api/v1/payments/{order_id}/status",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["order_id"] == order_id
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_get_payment_status_not_found(client: AsyncClient, test_session):
    """Get payment status returns not_found when no payment exists."""
    await _register_user(client, "user-nf@test.com")
    user_token = await _get_token(client, "user-nf@test.com")

    resp = await client.get(
        "/api/v1/payments/99999/status",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "not_found"


# ###############################################################################
# Tests: Unauthenticated
# ###############################################################################


@pytest.mark.asyncio
async def test_create_preference_unauthenticated(client: AsyncClient):
    """No token returns 401 for create-preference."""
    resp = await client.post(
        "/api/v1/payments/create-preference",
        json={"order_id": 1},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_payment_status_unauthenticated(client: AsyncClient):
    """No token returns 401 for status."""
    resp = await client.get("/api/v1/payments/1/status")
    assert resp.status_code == 401
