"""
Categories router: public tree browsing and role-protected management.
"""
from fastapi import APIRouter, Depends, Request

from app.core.database import get_session
from app.core.rate_limit import limiter
from app.models.user import UserRole
from app.repositories.category_repository import CategoryRepository
from app.routers.dependencies import require_role
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryTreeNode,
    CategoryUpdate,
)
from app.services.category_service import CategoryService

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


def _get_category_service(session=Depends(get_session)) -> CategoryService:
    """Dependency: create CategoryService with repository."""
    return CategoryService(
        category_repo=CategoryRepository(session),
    )


# ─── Public endpoints ────────────────────────────────────────────────


@router.get("", response_model=list[CategoryTreeNode])
async def get_category_tree(
    service: CategoryService = Depends(_get_category_service),
):
    """Get the full category tree (public).
    Returns active non-deleted categories as a nested structure.
    """
    return await service.get_tree()


@router.get("/{category_id}", response_model=CategoryTreeNode)
async def get_category(
    category_id: int,
    service: CategoryService = Depends(_get_category_service),
):
    """Get a single category with its active children (public)."""
    return await service.get_with_children(category_id)


# ─── Role-protected endpoints (STAFF or ADMIN) ──────────────────────


@router.post("", response_model=CategoryResponse, status_code=201)
@limiter.limit("30/minute")
async def create_category(
    request: Request,
    data: CategoryCreate,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: CategoryService = Depends(_get_category_service),
):
    """Create a new category (STAFF, ADMIN)."""
    return await service.create(data)


@router.put("/{category_id}", response_model=CategoryResponse)
@limiter.limit("30/minute")
async def update_category(
    request: Request,
    category_id: int,
    data: CategoryUpdate,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: CategoryService = Depends(_get_category_service),
):
    """Update an existing category (STAFF, ADMIN)."""
    return await service.update(category_id, data)


@router.delete("/{category_id}", status_code=204)
@limiter.limit("30/minute")
async def delete_category(
    request: Request,
    category_id: int,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: CategoryService = Depends(_get_category_service),
):
    """Soft delete a category (STAFF, ADMIN).
    Blocks if the category has active children (409 Conflict).
    """
    await service.soft_delete(category_id)
