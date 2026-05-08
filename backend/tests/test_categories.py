"""
Tests for category endpoints: CRUD, tree, soft delete, circular references.
"""
import pytest
from httpx import AsyncClient

from app.models.user import User, UserRole
from app.schemas.auth import UserCreate
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository


# ─── Helpers ──────────────────────────────────────────────────────────

async def _create_user(
    test_session, email: str, role: UserRole = UserRole.CLIENTE
) -> User:
    """Create a user with specified role directly in the test DB."""
    user = User(
        email=email,
        first_name="Test",
        last_name="User",
        password_hash="hashed-placeholder",  # Will be overwritten by auth service
        role=role,
        is_active=True,
    )
    session = test_session
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


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


async def _create_staff_user_and_login(
    client: AsyncClient, test_session, email: str = "staff@test.com"
) -> tuple[str, str]:
    """Create a STAFF user via DB and return (access_token, refresh_token)."""
    # Register a user first (to get a proper password hash)
    await _register_user(client, email)

    # Promote to STAFF directly in DB
    user = await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )
    user_obj = user.scalar_one()
    user_obj.role = UserRole.STAFF
    await test_session.flush()

    # Login as STAFF
    tokens = await _login(client, email)
    return tokens["access_token"], tokens["refresh_token"]


async def _create_admin_user_and_login(
    client: AsyncClient, test_session, email: str = "admin@test.com"
) -> tuple[str, str]:
    """Create an ADMIN user via DB and return (access_token, refresh_token)."""
    await _register_user(client, email)
    user = (await test_session.execute(
        __import__("sqlmodel").select(User).where(User.email == email)
    )).scalar_one()
    user.role = UserRole.ADMIN
    await test_session.flush()
    tokens = await _login(client, email)
    return tokens["access_token"], tokens["refresh_token"]


# ─── T5.1: Category Creation ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_root_category(client: AsyncClient, test_session):
    """STAFF creates a root category successfully."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    payload = {"name": "Bebidas", "description": "All drinks"}
    response = await client.post(
        "/api/v1/categories",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == "Bebidas"
    assert data["description"] == "All drinks"
    assert data["parent_id"] is None
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_create_child_category(client: AsyncClient, test_session):
    """STAFF creates a child category under an existing root."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    # Create root category
    root_resp = await client.post(
        "/api/v1/categories",
        json={"name": "Bebidas"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    root_id = root_resp.json()["id"]

    # Create child
    payload = {"name": "Gaseosas", "parent_id": root_id}
    response = await client.post(
        "/api/v1/categories",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["name"] == "Gaseosas"
    assert data["parent_id"] == root_id


@pytest.mark.asyncio
async def test_create_category_invalid_parent(client: AsyncClient, test_session):
    """STAFF creates a category with non-existent parent returns 404."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    payload = {"name": "Huérfana", "parent_id": 99999}
    response = await client.post(
        "/api/v1/categories",
        json=payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 404, response.text


@pytest.mark.asyncio
async def test_create_category_unauthorized(client: AsyncClient):
    """CLIENTE tries to create a category returns 403."""
    await _register_user(client, "cliente@test.com")
    tokens = await _login(client, "cliente@test.com")

    payload = {"name": "No debería poder"}
    response = await client.post(
        "/api/v1/categories",
        json=payload,
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert response.status_code == 403, response.text


@pytest.mark.asyncio
async def test_create_category_unauthenticated(client: AsyncClient):
    """Unauthenticated user tries to create a category returns 401."""
    payload = {"name": "No auth"}
    response = await client.post("/api/v1/categories", json=payload)
    assert response.status_code == 401, response.text


# ─── T5.2: Tree Endpoint ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_tree_returns_nested_structure(client: AsyncClient, test_session):
    """GET /api/v1/categories returns nested tree."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    # Create: Bebidas -> Gaseosas, Aguas
    bebidas_resp = await client.post(
        "/api/v1/categories", json={"name": "Bebidas"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    bebidas_id = bebidas_resp.json()["id"]

    await client.post(
        "/api/v1/categories", json={"name": "Gaseosas", "parent_id": bebidas_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    await client.post(
        "/api/v1/categories", json={"name": "Aguas", "parent_id": bebidas_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Get tree
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data) >= 1
    bebidas_node = next(c for c in data if c["name"] == "Bebidas")
    assert len(bebidas_node["children"]) == 2
    child_names = {c["name"] for c in bebidas_node["children"]}
    assert child_names == {"Gaseosas", "Aguas"}


@pytest.mark.asyncio
async def test_get_tree_excludes_inactive_deleted(client: AsyncClient, test_session):
    """Tree excludes inactive and soft-deleted categories."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    # Create root categories
    r1 = await client.post(
        "/api/v1/categories", json={"name": "Activa"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    r2 = await client.post(
        "/api/v1/categories", json={"name": "Inactiva", "is_active": False},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    r3 = await client.post(
        "/api/v1/categories", json={"name": "SeBorra"},
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Soft delete r3
    await client.delete(
        f"/api/v1/categories/{r3.json()['id']}",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Get tree
    response = await client.get("/api/v1/categories")
    names = {c["name"] for c in response.json()}
    assert "Activa" in names
    assert "Inactiva" not in names
    assert "SeBorra" not in names


@pytest.mark.asyncio
async def test_get_tree_empty(client: AsyncClient):
    """No categories returns empty list."""
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200, response.text
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_single_category_with_children(client: AsyncClient, test_session):
    """GET /api/v1/categories/{id} returns category with children."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    root = await client.post(
        "/api/v1/categories", json={"name": "Root"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    root_id = root.json()["id"]

    await client.post(
        "/api/v1/categories", json={"name": "Child", "parent_id": root_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )

    response = await client.get(f"/api/v1/categories/{root_id}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == "Root"
    assert len(data["children"]) == 1
    assert data["children"][0]["name"] == "Child"


@pytest.mark.asyncio
async def test_get_nonexistent_category(client: AsyncClient):
    """GET /api/v1/categories/{id} with invalid id returns 404."""
    response = await client.get("/api/v1/categories/99999")
    assert response.status_code == 404, response.text


# ─── T5.3: Soft Delete ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_soft_delete_leaf_category(client: AsyncClient, test_session):
    """Delete a category without children returns 204."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    resp = await client.post(
        "/api/v1/categories", json={"name": "Bebida"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    cat_id = resp.json()["id"]

    response = await client.delete(
        f"/api/v1/categories/{cat_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 204, response.text

    # Verify it's gone from tree
    tree = await client.get("/api/v1/categories")
    ids = {c["id"] for c in tree.json()}
    assert cat_id not in ids


@pytest.mark.asyncio
async def test_soft_delete_with_active_children_returns_409(
    client: AsyncClient, test_session
):
    """Delete a parent with active children returns 409."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    # Create parent
    parent_resp = await client.post(
        "/api/v1/categories", json={"name": "Parent"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    parent_id = parent_resp.json()["id"]

    # Create child
    await client.post(
        "/api/v1/categories", json={"name": "Child", "parent_id": parent_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Try to delete parent
    response = await client.delete(
        f"/api/v1/categories/{parent_id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 409, response.text


# ─── T5.4: Circular Reference Prevention ──────────────────────────────

@pytest.mark.asyncio
async def test_circular_reference_prevented(client: AsyncClient, test_session):
    """Updating a parent to create a cycle returns 422."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    # Create: A -> B -> C
    a_resp = await client.post(
        "/api/v1/categories", json={"name": "A"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    a_id = a_resp.json()["id"]

    b_resp = await client.post(
        "/api/v1/categories", json={"name": "B", "parent_id": a_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    b_id = b_resp.json()["id"]

    c_resp = await client.post(
        "/api/v1/categories", json={"name": "C", "parent_id": b_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    c_id = c_resp.json()["id"]

    # Try to set A's parent to C (would create: A -> B -> C -> A)
    response = await client.put(
        f"/api/v1/categories/{a_id}",
        json={"parent_id": c_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 422, response.text


@pytest.mark.asyncio
async def test_self_parent_prevented(client: AsyncClient, test_session):
    """Setting a category's parent to itself returns 422."""
    access_token, _ = await _create_staff_user_and_login(client, test_session)

    resp = await client.post(
        "/api/v1/categories", json={"name": "Solo"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    cat_id = resp.json()["id"]

    response = await client.put(
        f"/api/v1/categories/{cat_id}",
        json={"parent_id": cat_id},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 422, response.text
