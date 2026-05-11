"""
Tests for product endpoints: CRUD, filters, soft delete, associations.
"""
import pytest
from httpx import AsyncClient
from sqlmodel import select

from app.models.user import User, UserRole


# ###############################################################################
# Helpers
# ###############################################################################


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
    client: AsyncClient, test_session, email: str = "staff-prod@test.com"
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


async def _create_category(
    client: AsyncClient, token: str, name: str = "Test Category"
):
    """Create a category using the API."""
    resp = await client.post(
        "/api/v1/categories",
        json={"name": name},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _create_ingredient(
    client: AsyncClient, token: str, name: str = "Test Ingredient"
):
    """Create an ingredient using the API."""
    resp = await client.post(
        "/api/v1/ingredients",
        json={"name": name, "es_alergeno": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


async def _create_product(
    client: AsyncClient,
    token: str,
    name: str = "Test Product",
    price: str = "10.50",
    category_ids: list[int] = None,
    ingredient_ids: list[int] = None,
):
    """Create a product using the API."""
    data = {
        "name": name,
        "price": price,
        "stock": 100,
        "available": True,
    }
    if category_ids is not None:
        data["category_ids"] = category_ids
    if ingredient_ids is not None:
        data["ingredient_ids"] = ingredient_ids
    resp = await client.post(
        "/api/v1/products",
        json=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp


# ###############################################################################
# Tests: Create
# ###############################################################################


@pytest.mark.asyncio
async def test_create_product_success(client: AsyncClient, test_session):
    """STAFF can create a product with categories and ingredients."""
    token, _ = await _create_staff_and_login(client, test_session)

    # Create prerequisite category and ingredient
    cat_resp = await _create_category(client, token, "Bebidas")
    assert cat_resp.status_code == 201
    ing_resp = await _create_ingredient(client, token, "Agua")
    assert ing_resp.status_code == 201

    resp = await _create_product(
        client, token,
        name="Agua Mineral",
        price="15.00",
        category_ids=[cat_resp.json()["id"]],
        ingredient_ids=[ing_resp.json()["id"]],
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Agua Mineral"
    assert data["price"] == "15.00"
    assert data["stock"] == 100
    assert data["available"] is True
    assert data["category_ids"] == [cat_resp.json()["id"]]
    assert data["ingredient_ids"] == [ing_resp.json()["id"]]


@pytest.mark.asyncio
async def test_create_product_duplicate_name(client: AsyncClient, test_session):
    """Creating a product with a duplicate name returns 409."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_product(client, token, "Producto Unico", "25.00")
    resp = await _create_product(client, token, "Producto Unico", "30.00")
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_create_product_invalid_category(client: AsyncClient, test_session):
    """Creating a product with a non-existent category returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await _create_product(
        client, token,
        name="Producto Sin Categoria",
        price="10.00",
        category_ids=[99999],
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_product_invalid_ingredient(client: AsyncClient, test_session):
    """Creating a product with a non-existent ingredient returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    # Create a valid category first so we can isolate the ingredient error
    cat_resp = await _create_category(client, token, "Valida")
    assert cat_resp.status_code == 201

    resp = await _create_product(
        client, token,
        name="Producto Sin Ingrediente",
        price="10.00",
        category_ids=[cat_resp.json()["id"]],
        ingredient_ids=[99999],
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_product_unauthorized(client: AsyncClient, test_session):
    """CLIENTE cannot create a product."""
    user = await _register_user(client, "cliente-prod@test.com")
    token = user.get("access_token") or (await _login(client, "cliente-prod@test.com"))["access_token"]

    resp = await client.post(
        "/api/v1/products",
        json={"name": "Test", "price": "10.00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_product_unauthenticated(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.post(
        "/api/v1/products",
        json={"name": "Test", "price": "10.00"},
    )
    assert resp.status_code == 401


# ###############################################################################
# Tests: List
# ###############################################################################


@pytest.mark.asyncio
async def test_list_products_empty(client: AsyncClient, test_session):
    """List products returns empty list when no products exist."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await client.get(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_list_products_with_data(client: AsyncClient, test_session):
    """List products returns created products."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_product(client, token, "Producto A", "10.00")
    await _create_product(client, token, "Producto B", "20.00")

    resp = await client.get(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_products_filter_by_category(client: AsyncClient, test_session):
    """Filter products by category ID."""
    token, _ = await _create_staff_and_login(client, test_session)

    cat1 = (await _create_category(client, token, "CatA")).json()
    cat2 = (await _create_category(client, token, "CatB")).json()

    await _create_product(client, token, "ProdA", "10.00", category_ids=[cat1["id"]])
    await _create_product(client, token, "ProdB", "20.00", category_ids=[cat2["id"]])

    resp = await client.get(
        f"/api/v1/products?category_id={cat1['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1


@pytest.mark.asyncio
async def test_list_products_search(client: AsyncClient, test_session):
    """Search products by name."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_product(client, token, "Manzana Roja", "15.00")
    await _create_product(client, token, "Manzana Verde", "12.00")
    await _create_product(client, token, "Pera", "10.00")

    resp = await client.get(
        "/api/v1/products?search=Manzana",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert all("Manzana" in item["name"] for item in data["items"])


@pytest.mark.asyncio
async def test_list_products_filter_available(client: AsyncClient, test_session):
    """Filter products by availability."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_product(client, token, "Disponible", "10.00")
    # Create unavailable product
    resp = await client.post(
        "/api/v1/products",
        json={"name": "No Disponible", "price": "5.00", "stock": 0, "available": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201

    resp = await client.get(
        "/api/v1/products?available=true",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Disponible"


# ###############################################################################
# Tests: Get by ID
# ###############################################################################


@pytest.mark.asyncio
async def test_get_product_by_id(client: AsyncClient, test_session):
    """Get a single product by ID with associations."""
    token, _ = await _create_staff_and_login(client, test_session)

    cat_resp = (await _create_category(client, token, "Lacteos")).json()
    ing_resp = (await _create_ingredient(client, token, "Leche")).json()

    created = (await _create_product(
        client, token,
        name="Yogurt Natural",
        price="8.50",
        category_ids=[cat_resp["id"]],
        ingredient_ids=[ing_resp["id"]],
    )).json()

    resp = await client.get(
        f"/api/v1/products/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Yogurt Natural"
    assert data["price"] == "8.50"
    assert cat_resp["id"] in data["category_ids"]
    assert ing_resp["id"] in data["ingredient_ids"]


@pytest.mark.asyncio
async def test_get_product_not_found(client: AsyncClient, test_session):
    """Getting a non-existent product returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await client.get(
        "/api/v1/products/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


# ###############################################################################
# Tests: Update
# ###############################################################################


@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, test_session):
    """STAFF can update a product with category/ingredient sync."""
    token, _ = await _create_staff_and_login(client, test_session)

    cat_resp = (await _create_category(client, token, "Snacks")).json()
    created = (await _create_product(
        client, token,
        name="Papas Fritas",
        price="5.00",
    )).json()

    resp = await client.put(
        f"/api/v1/products/{created['id']}",
        json={
            "name": "Papas Fritas Grandes",
            "price": "7.50",
            "category_ids": [cat_resp["id"]],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Papas Fritas Grandes"
    assert data["price"] == "7.50"
    assert cat_resp["id"] in data["category_ids"]


@pytest.mark.asyncio
async def test_update_product_duplicate_name(client: AsyncClient, test_session):
    """Updating to a duplicate name returns 409."""
    token, _ = await _create_staff_and_login(client, test_session)

    await _create_product(client, token, "Producto Original", "10.00")
    created2 = (await _create_product(client, token, "Otro Producto", "15.00")).json()

    resp = await client.put(
        f"/api/v1/products/{created2['id']}",
        json={"name": "Producto Original"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 409


# ###############################################################################
# Tests: Soft Delete
# ###############################################################################


@pytest.mark.asyncio
async def test_delete_product(client: AsyncClient, test_session):
    """STAFF can soft delete a product."""
    token, _ = await _create_staff_and_login(client, test_session)

    created = (await _create_product(client, token, "Producto a Eliminar", "10.00")).json()

    resp = await client.delete(
        f"/api/v1/products/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 204

    # Verify it's soft-deleted (returns 404)
    get_resp = await client.get(
        f"/api/v1/products/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_product_not_found(client: AsyncClient, test_session):
    """Deleting a non-existent product returns 404."""
    token, _ = await _create_staff_and_login(client, test_session)

    resp = await client.delete(
        "/api/v1/products/99999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404
