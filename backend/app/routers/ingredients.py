"""
Ingredients router: public queries and role-protected management.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request

from app.core.database import get_session
from app.core.rate_limit import limiter
from app.models.user import UserRole
from app.repositories.ingredient_repository import IngredientRepository
from app.routers.dependencies import require_role
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientResponse,
    IngredientUpdate,
)
from app.services.ingredient_service import IngredientService

router = APIRouter(prefix="/api/v1/ingredients", tags=["ingredients"])


def _get_ingredient_service(
    session=Depends(get_session),
) -> IngredientService:
    """Dependency: create IngredientService with repository."""
    return IngredientService(
        ingredient_repo=IngredientRepository(session),
    )


# ─── Public endpoints ────────────────────────────────────────────────


@router.get("")
async def list_ingredients(
    es_alergeno: Optional[bool] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=100),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    service: IngredientService = Depends(_get_ingredient_service),
):
    """List ingredients with optional filters (authenticated users).
    
    Supports filtering by allergen status and name search.
    """
    items, total = await service.list_all(
        skip=skip, limit=limit,
        es_alergeno=es_alergeno, search=search,
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient(
    ingredient_id: int,
    service: IngredientService = Depends(_get_ingredient_service),
):
    """Get a single ingredient by ID (authenticated users)."""
    return await service.get_by_id(ingredient_id)


# ─── Role-protected endpoints (STAFF or ADMIN) ──────────────────────


@router.post("", response_model=IngredientResponse, status_code=201)
@limiter.limit("30/minute")
async def create_ingredient(
    request: Request,
    data: IngredientCreate,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: IngredientService = Depends(_get_ingredient_service),
):
    """Create a new ingredient (STAFF, ADMIN)."""
    return await service.create(data)


@router.put("/{ingredient_id}", response_model=IngredientResponse)
@limiter.limit("30/minute")
async def update_ingredient(
    request: Request,
    ingredient_id: int,
    data: IngredientUpdate,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: IngredientService = Depends(_get_ingredient_service),
):
    """Update an existing ingredient (STAFF, ADMIN)."""
    return await service.update(ingredient_id, data)


@router.delete("/{ingredient_id}", status_code=204)
@limiter.limit("30/minute")
async def delete_ingredient(
    request: Request,
    ingredient_id: int,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: IngredientService = Depends(_get_ingredient_service),
):
    """Soft delete an ingredient (STAFF, ADMIN)."""
    await service.soft_delete(ingredient_id)
