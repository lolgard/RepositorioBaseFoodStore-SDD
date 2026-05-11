"""
Tests for the Order State Machine: transitions, stock restore, roles.
"""
import pytest
from httpx import AsyncClient
from sqlmodel import select

from app.models.user import User, UserRole
from app.models.product import Product


async def _register_user(client, email, password="SecurePass123!"):
    resp = await client.post("/api/v1/auth/register", json={
        "email": email, "password": password,
        "first_name": "Test", "last_name": "User",
    })
    assert resp.status_code == 201
    return resp.json()


async def _login(client, email, password="SecurePass123!"):
    resp = await client.post("/api/v1/auth/login", json={
        "email": email, "password": password,
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def _create_staff(client, test_session, email="staff-fsm@test.com"):
    await _register_user(client, email)
    user = (await test_session.execute(select(User).where(User.email == email))).scalar_one()
    user.role = UserRole.STAFF
    await test_session.flush()
    token = await _login(client, email)
    return token


async def _setup_order(client, test_session, user_email="fsm-user@test.com"):
    """Create a product, user, address, and order. Returns (user_token, order_id, product_id)."""
    staff_token = await _create_staff(client, test_session)

    # Create product
    prod_resp = await client.post(
        "/api/v1/products",
        json={"name": "FSM Pizza", "price": "20.00", "stock": 30, "available": True},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    # Register cliente
    await _register_user(client, user_email)
    user_token = await _login(client, user_email)

    # Create address
    addr_resp = await client.post(
        "/api/v1/addresses/",
        json={"street": "FSM St", "street_number": "100", "city": "TestCity", "state": "TS", "zip_code": "0000"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert addr_resp.status_code == 201
    address_id = addr_resp.json()["id"]

    # Create order
    order_resp = await client.post(
        "/api/v1/orders/",
        json={"delivery_address_id": address_id, "items": [{"product_id": product_id, "quantity": 2}]},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert order_resp.status_code == 201
    order_id = order_resp.json()["id"]

    return user_token, order_id, product_id, staff_token


# ###############################################################################
# FSM Transitions
# ###############################################################################


@pytest.mark.asyncio
async def test_pending_to_confirmed(client: AsyncClient, test_session):
    """GESTOR/STAFF can confirm a pending order."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED", "reason": "Payment received"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "CONFIRMED"
    history = resp.json()["status_history"]
    assert any(h["to_status"] == "CONFIRMED" for h in history)


@pytest.mark.asyncio
async def test_pending_to_cancelled_by_cliente(client: AsyncClient, test_session):
    """CLIENTE can cancel their own pending order."""
    user_token, order_id, _, _ = await _setup_order(client, test_session)

    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED", "reason": "Changed my mind"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "CANCELLED"


@pytest.mark.asyncio
async def test_pending_to_cancelled_by_staff(client: AsyncClient, test_session):
    """Staff can cancel a pending order."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "CANCELLED"


@pytest.mark.asyncio
async def test_confirmed_to_preparing(client: AsyncClient, test_session):
    """Confirm then prepare."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    # First confirm
    await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    # Then prepare
    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "PREPARING"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "PREPARING"


@pytest.mark.asyncio
async def test_preparing_to_ready(client: AsyncClient, test_session):
    """Full flow: confirm → prepare → ready."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    for status in ["CONFIRMED", "PREPARING", "READY"]:
        resp = await client.put(
            f"/api/v1/orders/{order_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        assert resp.status_code == 200, f"Failed at {status}: {resp.text}"
    assert resp.json()["status"] == "READY"


@pytest.mark.asyncio
async def test_ready_to_delivered(client: AsyncClient, test_session):
    """Full flow: confirm → prepare → ready → delivered."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    for status in ["CONFIRMED", "PREPARING", "READY", "DELIVERED"]:
        resp = await client.put(
            f"/api/v1/orders/{order_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        assert resp.status_code == 200, f"Failed at {status}: {resp.text}"
    assert resp.json()["status"] == "DELIVERED"


@pytest.mark.asyncio
async def test_invalid_transition(client: AsyncClient, test_session):
    """Cannot skip states: PENDING → READY is invalid."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "READY"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_terminal_state_locked(client: AsyncClient, test_session):
    """Cannot transition from a terminal state."""
    user_token, order_id, _, staff_token = await _setup_order(client, test_session)

    # Cancel by user
    await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    # Try to confirm cancelled order
    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 400


# ###############################################################################
# Role enforcement
# ###############################################################################


@pytest.mark.asyncio
async def test_cliente_cannot_confirm(client: AsyncClient, test_session):
    """CLIENTE cannot confirm their own order."""
    user_token, order_id, _, _ = await _setup_order(client, test_session)

    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cliente_cannot_cancel_others(client: AsyncClient, test_session):
    """CLIENTE cannot cancel another user's order."""
    # Create order for user A
    token_a, order_id, _, _ = await _setup_order(client, test_session, "user-a-fsm@test.com")

    # Create user B
    await _register_user(client, "user-b-fsm@test.com")
    token_b = await _login(client, "user-b-fsm@test.com")

    # User B tries to cancel user A's order
    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404  # ownership hides the order


# ###############################################################################
# Stock restore on cancel
# ###############################################################################


@pytest.mark.asyncio
async def test_stock_restored_on_cancel_pending(client: AsyncClient, test_session):
    """Stock is restored when cancelling a PENDING order."""
    user_token, order_id, product_id, _ = await _setup_order(client, test_session)

    # Check stock before: initial 30, ordered 2 = 28
    product_before = (await test_session.execute(select(Product).where(Product.id == product_id))).scalar_one()
    assert product_before.stock == 28  # 30 - 2 from order creation

    # Cancel
    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200

    # Stock restored: 28 + 2 = 30
    product_after = (await test_session.execute(select(Product).where(Product.id == product_id))).scalar_one()
    assert product_after.stock == 30, f"Expected 30, got {product_after.stock}"


@pytest.mark.asyncio
async def test_stock_restored_on_cancel_confirmed(client: AsyncClient, test_session):
    """Stock is restored when cancelling a CONFIRMED order."""
    _, order_id, product_id, staff_token = await _setup_order(client, test_session)

    # Confirm
    await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )

    # Cancel by staff
    resp = await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CANCELLED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert resp.status_code == 200

    product = (await test_session.execute(select(Product).where(Product.id == product_id))).scalar_one()
    assert product.stock == 30  # restored


@pytest.mark.asyncio
async def test_stock_not_restored_on_delivered(client: AsyncClient, test_session):
    """DELIVERED does not restore stock (not a cancel)."""
    _, order_id, product_id, staff_token = await _setup_order(client, test_session)

    for status in ["CONFIRMED", "PREPARING", "READY", "DELIVERED"]:
        resp = await client.put(
            f"/api/v1/orders/{order_id}/status",
            json={"status": status},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        assert resp.status_code == 200

    # Stock stays decremented (30 - 2 = 28)
    product = (await test_session.execute(select(Product).where(Product.id == product_id))).scalar_one()
    assert product.stock == 28


# ###############################################################################
# Unauthenticated
# ###############################################################################


@pytest.mark.asyncio
async def test_unauthenticated_status_change(client: AsyncClient):
    """No token returns 401."""
    resp = await client.put("/api/v1/orders/1/status", json={"status": "CONFIRMED"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_history_recorded(client: AsyncClient, test_session):
    """Each transition is recorded in status_history."""
    _, order_id, _, staff_token = await _setup_order(client, test_session)

    await client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "CONFIRMED"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )

    resp = await client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    history = resp.json()["status_history"]
    assert len(history) == 2  # PENDING + CONFIRMED
    assert history[1]["to_status"] == "CONFIRMED"
    assert history[1]["from_status"] == "PENDING"
