"""
Tests for order endpoints: creation, listing, detail, snapshots, stock.
"""
import pytest
from httpx import AsyncClient
from sqlmodel import select

from app.models.user import User, UserRole
from app.models.product import Product


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
    client: AsyncClient, test_session, email: str = "staff-order@test.com"
) -> tuple[str, str]:
    await _register_user(client, email)
    user = await test_session.execute(select(User).where(User.email == email))
    user_obj = user.scalar_one()
    user_obj.role = UserRole.STAFF
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"], tokens["refresh_token"]


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


async def _create_address(
    client: AsyncClient,
    token: str,
    street: str = "Av. Siempre Viva",
    street_number: str = "742",
    city: str = "Springfield",
    state: str = "BSAS",
    zip_code: str = "1234",
):
    resp = await client.post(
        "/api/v1/addresses/",
        json={
            "street": street,
            "street_number": street_number,
            "city": city,
            "state": state,
            "zip_code": zip_code,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _setup_order_scenario(
    client: AsyncClient, test_session, user_email: str = "order-user@test.com"
) -> tuple[str, int, int]:
    """Create STAFF, product, CLIENTE, address. Returns (client_token, product_id, address_id)."""
    staff_token, _ = await _create_staff_and_login(client, test_session)
    prod_resp = await _create_product(client, staff_token, "Pizza", "15.00", stock=50)
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    await _register_user(client, user_email)
    user_token = await _get_token(client, user_email)

    addr_resp = await _create_address(client, user_token)
    assert addr_resp.status_code == 201
    address_id = addr_resp.json()["id"]

    return user_token, product_id, address_id


# ###############################################################################
# Tests: Create Order
# ###############################################################################


@pytest.mark.asyncio
async def test_create_order_success(client: AsyncClient, test_session):
    """Create order successfully with items, snapshots, stock decrement, and history."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 2}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()

    assert data["status"] == "PENDING"
    assert data["subtotal"] == "30.00"
    assert data["delivery_cost"] == "0.00"
    assert data["total"] == "30.00"
    assert len(data["items"]) == 1
    assert data["items"][0]["product_name"] == "Pizza"
    assert data["items"][0]["product_price"] == "15.00"
    assert data["items"][0]["quantity"] == 2
    assert data["items"][0]["subtotal"] == "30.00"
    assert len(data["status_history"]) == 1
    assert data["status_history"][0]["to_status"] == "PENDING"
    assert data["status_history"][0]["from_status"] is None

    # Stock was decremented
    product = await test_session.execute(select(Product).where(Product.id == product_id))
    assert product.scalar_one().stock == 48


@pytest.mark.asyncio
async def test_create_order_insufficient_stock(client: AsyncClient, test_session):
    """Creating an order with insufficient stock returns 400."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 999}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_create_order_wrong_address(client: AsyncClient, test_session):
    """Creating an order with another user's address returns 404."""
    user_token, product_id, _ = await _setup_order_scenario(client, test_session)

    # Create another user who owns a different address
    await _register_user(client, "other@test.com")
    other_token = await _get_token(client, "other@test.com")
    addr_resp = await _create_address(client, other_token)
    assert addr_resp.status_code == 201
    other_address_id = addr_resp.json()["id"]

    # Try to use that address
    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": other_address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order_product_not_found(client: AsyncClient, test_session):
    """Creating an order with a non-existent product returns 404."""
    user_token, _, address_id = await _setup_order_scenario(client, test_session)

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": 99999, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order_unauthenticated(client: AsyncClient):
    """Creating an order without auth returns 401."""
    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": 1,
            "items": [{"product_id": 1, "quantity": 1}],
        },
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_order_unavailable_product(client: AsyncClient, test_session):
    """Creating an order with an unavailable product returns 400."""
    staff_token, _ = await _create_staff_and_login(client, test_session)
    prod_resp = await client.post(
        "/api/v1/products",
        json={"name": "Off", "price": "5.00", "stock": 10, "available": False},
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    user_email = "unavail@test.com"
    await _register_user(client, user_email)
    user_token = await _get_token(client, user_email)
    addr_resp = await _create_address(client, user_token)
    address_id = addr_resp.json()["id"]

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 400


# ###############################################################################
# Tests: List Orders
# ###############################################################################


@pytest.mark.asyncio
async def test_list_orders_own(client: AsyncClient, test_session):
    """User can list their own orders."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get(
        "/api/v1/orders/",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["status"] == "PENDING"


@pytest.mark.asyncio
async def test_list_orders_other_users_not_visible(client: AsyncClient, test_session):
    """CLIENTE cannot see another user's orders."""
    token_a, product_id, address_id = await _setup_order_scenario(client, test_session, "user-a@test.com")

    await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {token_a}"},
    )

    await _register_user(client, "user-b@test.com")
    token_b = await _get_token(client, "user-b@test.com")

    resp = await client.get(
        "/api/v1/orders/",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 200
    assert resp.json() == []


# ###############################################################################
# Tests: Get Order Detail
# ###############################################################################


@pytest.mark.asyncio
async def test_get_order_detail(client: AsyncClient, test_session):
    """Get order detail includes items and status history."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    create_resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 3}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_resp.status_code == 201
    order_id = create_resp.json()["id"]

    resp = await client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == order_id
    assert len(data["items"]) == 1
    assert data["items"][0]["product_name"] == "Pizza"
    assert data["items"][0]["quantity"] == 3
    assert len(data["status_history"]) == 1
    assert data["status_history"][0]["to_status"] == "PENDING"


@pytest.mark.asyncio
async def test_get_order_other_user_not_found(client: AsyncClient, test_session):
    """Getting another user's order returns 404 for CLIENTE."""
    token_a, product_id, address_id = await _setup_order_scenario(client, test_session, "user-a@test.com")

    create_resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {token_a}"},
    )
    order_id = create_resp.json()["id"]

    await _register_user(client, "user-b@test.com")
    token_b = await _get_token(client, "user-b@test.com")

    resp = await client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Snapshots & Price isolation
# ###############################################################################


@pytest.mark.asyncio
async def test_address_snapshot_fields(client: AsyncClient, test_session):
    """Address snapshot contains all required fields."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 201
    snapshot = resp.json()["address_snapshot"]
    assert snapshot["street"] == "Av. Siempre Viva"
    assert snapshot["street_number"] == "742"
    assert snapshot["city"] == "Springfield"
    assert snapshot["state"] == "BSAS"
    assert snapshot["zip_code"] == "1234"
    assert snapshot["country"] == "Argentina"


@pytest.mark.asyncio
async def test_price_snapshot_isolation(client: AsyncClient, test_session):
    """Order prices are snapshots and don't change when product price changes."""
    user_token, product_id, address_id = await _setup_order_scenario(client, test_session)

    resp = await client.post(
        "/api/v1/orders/",
        json={
            "delivery_address_id": address_id,
            "items": [{"product_id": product_id, "quantity": 2}],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 201
    order_id = resp.json()["id"]
    assert resp.json()["subtotal"] == "30.00"

    # Change product price
    staff_token, _ = await _create_staff_and_login(client, test_session, "staff-price@test.com")
    await client.put(
        f"/api/v1/products/{product_id}",
        json={"price": "99.99"},
        headers={"Authorization": f"Bearer {staff_token}"},
    )

    order_resp = await client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert order_resp.status_code == 200
    assert order_resp.json()["subtotal"] == "30.00"
    assert order_resp.json()["items"][0]["product_price"] == "15.00"


# ###############################################################################
# Tests: Unauthenticated access
# ###############################################################################


@pytest.mark.asyncio
async def test_unauthenticated_list(client: AsyncClient):
    """No token returns 401 for GET list."""
    resp = await client.get("/api/v1/orders/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_get_detail(client: AsyncClient):
    """No token returns 401 for GET detail."""
    resp = await client.get("/api/v1/orders/1")
    assert resp.status_code == 401
