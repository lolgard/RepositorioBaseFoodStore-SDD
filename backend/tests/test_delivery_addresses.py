"""
Tests for delivery address endpoints: CRUD, ownership, soft delete, default.
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


async def _create_address(
    client: AsyncClient,
    token: str,
    street: str = "Av. Siempre Viva",
    street_number: str = "742",
    city: str = "Springfield",
    state: str = "BSAS",
    zip_code: str = "1234",
    is_default: bool = False,
):
    data = {
        "street": street,
        "street_number": street_number,
        "city": city,
        "state": state,
        "zip_code": zip_code,
        "is_default": is_default,
    }
    resp = await client.post(
        "/api/v1/addresses/",
        json=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


# ###############################################################################
# Tests: Create
# ###############################################################################


@pytest.mark.asyncio
async def test_create_address_success(client: AsyncClient, test_session):
    """User can create a delivery address."""
    await _register_user(client, "addr-user@test.com")
    token = await _get_token(client, "addr-user@test.com")

    resp = await _create_address(client, token)
    assert resp.status_code == 201
    data = resp.json()
    assert data["street"] == "Av. Siempre Viva"
    assert data["street_number"] == "742"
    assert data["city"] == "Springfield"
    assert data["state"] == "BSAS"
    assert data["zip_code"] == "1234"
    assert data["country"] == "Argentina"
    assert data["is_default"] is True
    assert data["additional_info"] is None
    assert "id" in data
    assert data["user_id"] is not None


@pytest.mark.asyncio
async def test_create_max_addresses(client: AsyncClient, test_session):
    """Creating more than 5 addresses returns 400."""
    await _register_user(client, "max-addr@test.com")
    token = await _get_token(client, "max-addr@test.com")

    for i in range(5):
        resp = await _create_address(client, token, street=f"Street {i}", street_number=str(i))
        assert resp.status_code == 201, f"Failed on address {i}: {resp.text}"

    resp = await _create_address(client, token, street="Overflow", street_number="999")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_first_address_is_default(client: AsyncClient, test_session):
    """The first address created is automatically set as default."""
    await _register_user(client, "first-def@test.com")
    token = await _get_token(client, "first-def@test.com")

    resp = await _create_address(client, token, is_default=False)
    assert resp.status_code == 201
    assert resp.json()["is_default"] is True


@pytest.mark.asyncio
async def test_create_address_with_explicit_default(client: AsyncClient, test_session):
    """User can create an address explicitly as default, second address is not default."""
    await _register_user(client, "explicit-def@test.com")
    token = await _get_token(client, "explicit-def@test.com")

    resp1 = await _create_address(client, token, street="First", street_number="1", is_default=True)
    assert resp1.status_code == 201
    assert resp1.json()["is_default"] is True

    resp2 = await _create_address(client, token, street="Second", street_number="2", is_default=False)
    assert resp2.status_code == 201
    assert resp2.json()["is_default"] is False


@pytest.mark.asyncio
async def test_create_address_unauthorized(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await _create_address(client, "invalid-token")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_address_unauthenticated(client: AsyncClient):
    """No auth header returns 401."""
    resp = await client.post("/api/v1/addresses/", json={
        "street": "Test", "street_number": "123", "city": "City",
        "state": "ST", "zip_code": "0000",
    })
    assert resp.status_code == 401


# ###############################################################################
# Tests: List
# ###############################################################################


@pytest.mark.asyncio
async def test_list_addresses(client: AsyncClient, test_session):
    """List all addresses for the authenticated user."""
    await _register_user(client, "list-addr@test.com")
    token = await _get_token(client, "list-addr@test.com")

    await _create_address(client, token, street="Street 1", street_number="1")
    await _create_address(client, token, street="Street 2", street_number="2")

    resp = await client.get(
        "/api/v1/addresses/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["is_default"] is True
    assert data[1]["is_default"] is False


@pytest.mark.asyncio
async def test_list_addresses_other_user_not_visible(client: AsyncClient, test_session):
    """Addresses from one user are not visible to another."""
    await _register_user(client, "user-a@test.com")
    await _register_user(client, "user-b@test.com")
    token_a = await _get_token(client, "user-a@test.com")
    token_b = await _get_token(client, "user-b@test.com")

    await _create_address(client, token_a, street="A's Street", street_number="1")

    resp = await client.get(
        "/api/v1/addresses/",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_addresses_empty(client: AsyncClient, test_session):
    """Empty list when user has no addresses."""
    await _register_user(client, "empty-addr@test.com")
    token = await _get_token(client, "empty-addr@test.com")

    resp = await client.get(
        "/api/v1/addresses/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json() == []


# ###############################################################################
# Tests: Get by ID
# ###############################################################################


@pytest.mark.asyncio
async def test_get_address_by_id(client: AsyncClient, test_session):
    """Get a specific address by ID."""
    await _register_user(client, "get-addr@test.com")
    token = await _get_token(client, "get-addr@test.com")

    created = (await _create_address(client, token)).json()

    resp = await client.get(
        f"/api/v1/addresses/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == created["id"]
    assert data["street"] == "Av. Siempre Viva"


@pytest.mark.asyncio
async def test_get_address_not_found(client: AsyncClient, test_session):
    """Getting a non-existent address returns 404."""
    await _register_user(client, "notfound-addr@test.com")
    token = await _get_token(client, "notfound-addr@test.com")

    resp = await client.get(
        "/api/v1/addresses/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_address_other_user_not_found(client: AsyncClient, test_session):
    """Getting another user's address returns 404."""
    await _register_user(client, "owner@test.com")
    await _register_user(client, "intruder@test.com")
    token_owner = await _get_token(client, "owner@test.com")
    token_intruder = await _get_token(client, "intruder@test.com")

    created = (await _create_address(client, token_owner)).json()

    resp = await client.get(
        f"/api/v1/addresses/{created['id']}",
        headers={"Authorization": f"Bearer {token_intruder}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Update
# ###############################################################################


@pytest.mark.asyncio
async def test_update_address(client: AsyncClient, test_session):
    """User can update their own address."""
    await _register_user(client, "update-addr@test.com")
    token = await _get_token(client, "update-addr@test.com")

    created = (await _create_address(client, token)).json()

    resp = await client.put(
        f"/api/v1/addresses/{created['id']}",
        json={"street": "New Street", "street_number": "999"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["street"] == "New Street"
    assert data["street_number"] == "999"
    assert data["city"] == "Springfield"


@pytest.mark.asyncio
async def test_update_address_other_user_not_found(client: AsyncClient, test_session):
    """Updating another user's address returns 404."""
    await _register_user(client, "owner2@test.com")
    await _register_user(client, "intruder2@test.com")
    token_owner = await _get_token(client, "owner2@test.com")
    token_intruder = await _get_token(client, "intruder2@test.com")

    created = (await _create_address(client, token_owner)).json()

    resp = await client.put(
        f"/api/v1/addresses/{created['id']}",
        json={"street": "Hacked"},
        headers={"Authorization": f"Bearer {token_intruder}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Delete (soft delete)
# ###############################################################################


@pytest.mark.asyncio
async def test_delete_address(client: AsyncClient, test_session):
    """User can soft delete their own address."""
    await _register_user(client, "delete-addr@test.com")
    token = await _get_token(client, "delete-addr@test.com")

    created = (await _create_address(client, token)).json()

    resp = await client.delete(
        f"/api/v1/addresses/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Address deleted successfully"

    get_resp = await client.get(
        f"/api/v1/addresses/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_address_not_found(client: AsyncClient, test_session):
    """Deleting a non-existent address returns 404."""
    await _register_user(client, "delete-nf@test.com")
    token = await _get_token(client, "delete-nf@test.com")

    resp = await client.delete(
        "/api/v1/addresses/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Set Default
# ###############################################################################


@pytest.mark.asyncio
async def test_set_default_address(client: AsyncClient, test_session):
    """Setting a new default unmarks the previous default."""
    await _register_user(client, "default-addr@test.com")
    token = await _get_token(client, "default-addr@test.com")

    addr1 = (await _create_address(client, token, street="First", street_number="1")).json()
    assert addr1["is_default"] is True

    addr2 = (await _create_address(client, token, street="Second", street_number="2")).json()
    assert addr2["is_default"] is False

    resp = await client.put(
        f"/api/v1/addresses/{addr2['id']}/default",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["is_default"] is True

    resp1 = await client.get(
        f"/api/v1/addresses/{addr1['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp1.status_code == 200
    assert resp1.json()["is_default"] is False


@pytest.mark.asyncio
async def test_set_default_other_user_not_found(client: AsyncClient, test_session):
    """Setting default on another user's address returns 404."""
    await _register_user(client, "owner3@test.com")
    await _register_user(client, "intruder3@test.com")
    token_owner = await _get_token(client, "owner3@test.com")
    token_intruder = await _get_token(client, "intruder3@test.com")

    created = (await _create_address(client, token_owner)).json()

    resp = await client.put(
        f"/api/v1/addresses/{created['id']}/default",
        headers={"Authorization": f"Bearer {token_intruder}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Unauthenticated
# ###############################################################################


@pytest.mark.asyncio
async def test_unauthenticated_get(client: AsyncClient):
    """No token returns 401 for GET."""
    resp = await client.get("/api/v1/addresses/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_post(client: AsyncClient):
    """No token returns 401 for POST."""
    resp = await client.post("/api/v1/addresses/", json={
        "street": "Test", "street_number": "1", "city": "C",
        "state": "S", "zip_code": "0000",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_put(client: AsyncClient):
    """No token returns 401 for PUT."""
    resp = await client.put("/api/v1/addresses/1", json={"street": "X"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_delete(client: AsyncClient):
    """No token returns 401 for DELETE."""
    resp = await client.delete("/api/v1/addresses/1")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unauthenticated_set_default(client: AsyncClient):
    """No token returns 401 for default set."""
    resp = await client.put("/api/v1/addresses/1/default")
    assert resp.status_code == 401
