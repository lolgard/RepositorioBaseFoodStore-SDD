"""
Tests for admin catalog access: ADMIN bypass for products, categories, ingredients.
"""
import pytest
from httpx import AsyncClient

from app.models.user import User, UserRole


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


async def _create_admin(client: AsyncClient, test_session, email: str = "admin-cat@test.com"):
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.ADMIN
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


async def _create_staff(client: AsyncClient, test_session, email: str = "staff-cat@test.com"):
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.STAFF
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"]


@pytest.mark.asyncio
async def test_admin_can_create_category(client: AsyncClient, test_session):
    """ADMIN can POST to /api/v1/categories."""
    token = await _create_admin(client, test_session)
    resp = await client.post(
        "/api/v1/categories",
        json={"name": "Admin Category", "description": "Created by admin"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["name"] == "Admin Category"


@pytest.mark.asyncio
async def test_admin_can_update_product(client: AsyncClient, test_session):
    """ADMIN can PUT to /api/v1/products/:id."""
    token = await _create_admin(client, test_session, "admin-cat2@test.com")
    # First create a category
    cat_resp = await client.post(
        "/api/v1/categories",
        json={"name": "Test Category", "description": "For product test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cat_resp.status_code == 201
    category_id = cat_resp.json()["id"]

    # Create a product
    prod_resp = await client.post(
        "/api/v1/products",
        json={
            "name": "Test Product",
            "category_id": category_id,
            "price": 100.00,
            "stock": 10,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert prod_resp.status_code == 201, prod_resp.text
    product_id = prod_resp.json()["id"]

    # Update the product
    update_resp = await client.put(
        f"/api/v1/products/{product_id}",
        json={"name": "Updated Product", "price": 150.00},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200, update_resp.text
    assert update_resp.json()["name"] == "Updated Product"


@pytest.mark.asyncio
async def test_admin_can_delete_ingredient(client: AsyncClient, test_session):
    """ADMIN can DELETE /api/v1/ingredients/:id."""
    token = await _create_admin(client, test_session, "admin-cat3@test.com")
    # Create an ingredient
    ing_resp = await client.post(
        "/api/v1/ingredients",
        json={"name": "Test Ingredient", "stock": 50},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ing_resp.status_code == 201, ing_resp.text
    ingredient_id = ing_resp.json()["id"]

    # Delete
    del_resp = await client.delete(
        f"/api/v1/ingredients/{ingredient_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 204, del_resp.text


@pytest.mark.asyncio
async def test_staff_can_create_category(client: AsyncClient, test_session):
    """STAFF can also create categories (allowed role)."""
    token = await _create_staff(client, test_session)
    resp = await client.post(
        "/api/v1/categories",
        json={"name": "Staff Category", "description": "Created by staff"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
