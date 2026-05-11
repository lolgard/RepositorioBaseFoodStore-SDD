"""
Tests for ingredient endpoints: CRUD, filters, soft delete.
"""
import pytest
from httpx import AsyncClient
from sqlmodel import select

from app.models.user import User, UserRole


# ─── Helpers ──────────────────────────────────────────────────────────

async def _register_user(
    client: AsyncClient, email: str, password: str = "SecurePass123!"
) -> dict:
    """Register a CLIENTE and return their data."""
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "first_name": "Test",
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


async def _create_staff_and_login(
    client: AsyncClient, test_session, email: str = "staff@test.com"
) -> tuple[str, str]:
    """Create a STAFF user via DB and return (access_token, refresh_token)."""
    await _register_user(client, email)

    user = await test_session.execute(
        select(User).where(User.email == email)
    )
    user_obj = user.scalar_one()
    user_obj.role = UserRole.STAFF
    await test_session.flush()

    tokens = await _login(client, email)
    return tokens["access_token"], tokens["refresh_token"]


async def _create_ingredient(client: AsyncClient, token: str, name: str = "Test Ingredient", alergeno: bool = False):
    """Create an ingredient using the API."""
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": name, "es_alergeno": alergeno},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


# ─── Tests: Create ────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_ingredient_success(client: AsyncClient, test_session):
    """STAFF can create an ingredient."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await _create_ingredient(client, token, "Harina de trigo")
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Harina de trigo"
    assert data["es_alergeno"] is False
    assert data["id"] is not None


@pytest.mark.asyncio
async def test_create_ingredient_allergen(client: AsyncClient, test_session):
    """STAFF can create an ingredient marked as allergen."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await _create_ingredient(client, token, "Peanuts", alergeno=True)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Peanuts"
    assert data["es_alergeno"] is True


@pytest.mark.asyncio
async def test_create_ingredient_duplicate_name(client: AsyncClient, test_session):
    """Creating an ingredient with a duplicate name returns 409."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_ingredient(client, token, "Leche")
    resp = await _create_ingredient(client, token, "Leche")
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_create_ingredient_unauthorized(client: AsyncClient, test_session):
    """CLIENTE cannot create an ingredient."""
    user = await _register_user(client, "client@test.com")
    token = user.get("access_token") or (await _login(client, "client@test.com"))["access_token"]

    # Actually need to get the token from register response
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": "Test", "es_alergeno": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_ingredient_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": "Test", "es_alergeno": False},
    )
    assert resp.status_code == 401


# ─── Tests: List ──────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_list_ingredients(client: AsyncClient, test_session):
    """List all ingredients."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_ingredient(client, token, "Harina")
    await _create_ingredient(client, token, "Azúcar")

    resp = await client.get(
        "/api/v1/ingredients",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2


@pytest.mark.asyncio
async def test_list_ingredients_filter_allergen(client: AsyncClient, test_session):
    """Filter ingredients by es_alergeno flag."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_ingredient(client, token, "Leche", alergeno=True)
    await _create_ingredient(client, token, "Sal")

    resp = await client.get(
        "/api/v1/ingredients?es_alergeno=true",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert all(item["es_alergeno"] for item in data["items"])


@pytest.mark.asyncio
async def test_list_ingredients_search(client: AsyncClient, test_session):
    """Search ingredients by name."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_ingredient(client, token, "Harina de trigo")
    await _create_ingredient(client, token, "Harina de maíz")
    await _create_ingredient(client, token, "Azúcar")

    resp = await client.get(
        "/api/v1/ingredients?search=Harina",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert all("Harina" in item["name"] for item in data["items"])


# ─── Tests: Get by ID ────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_ingredient_by_id(client: AsyncClient, test_session):
    """Get a single ingredient by ID."""
    token, _ = await _create_staff_and_login(client, test_session)

    created = (await _create_ingredient(client, token, "Mostaza")).json()

    resp = await client.get(
        f"/api/v1/ingredients/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Mostaza"


@pytest.mark.asyncio
async def test_get_ingredient_not_found(client: AsyncClient, test_session):
    """Getting a non-existent ingredient returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await client.get(
        "/api/v1/ingredients/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


# ─── Tests: Update ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_update_ingredient(client: AsyncClient, test_session):
    """STAFF can update an ingredient."""
    token, _ = await _create_staff_and_login(client, test_session)

    created = (await _create_ingredient(client, token, "Ketchup")).json()

    resp = await client.put(
        f"/api/v1/ingredients/{created['id']}",
        json={"name": "Ketchup Orgánico", "es_alergeno": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Ketchup Orgánico"
    assert data["es_alergeno"] is True


@pytest.mark.asyncio
async def test_update_ingredient_duplicate_name(client: AsyncClient, test_session):
    """Updating to a duplicate name returns 409."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_ingredient(client, token, "Mayonesa")
    created2 = (await _create_ingredient(client, token, "Salsa BBQ")).json()

    resp = await client.put(
        f"/api/v1/ingredients/{created2['id']}",
        json={"name": "Mayonesa"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 409


# ─── Tests: Soft Delete ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_delete_ingredient(client: AsyncClient, test_session):
    """STAFF can soft delete an ingredient."""
    token, _ = await _create_staff_and_login(client, test_session)

    created = (await _create_ingredient(client, token, "Aceite")).json()

    resp = await client.delete(
        f"/api/v1/ingredients/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204

    # Verify it's soft-deleted (returns 404)
    get_resp = await client.get(
        f"/api/v1/ingredients/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_ingredient_not_found(client: AsyncClient, test_session):
    """Deleting a non-existent ingredient returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await client.delete(
        "/api/v1/ingredients/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404
