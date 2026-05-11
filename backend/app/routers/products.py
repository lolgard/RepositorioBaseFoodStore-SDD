"""
Products router: public queries and role-protected management.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request

from app.core.database import get_session
from app.core.rate_limit import limiter
from app.models.user import UserRole
from app.repositories.product_repository import ProductRepository
from app.routers.dependencies import require_role
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/v1/products", tags=["products"])


def _get_product_service(
    session=Depends(get_session),
) -> ProductService:
    """Dependency: create ProductService with repository."""
    return ProductService(
        product_repo=ProductRepository(session),
    )


# --- Public endpoints ---


@router.get("")
async def list_products(
    category_id: Optional[int] = Query(default=None),
    ingredient_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=200),
    available: Optional[bool] = Query(default=None),
    min_price: Optional[float] = Query(default=None, ge=0),
    max_price: Optional[float] = Query(default=None, ge=0),
    min_stock: Optional[int] = Query(default=None, ge=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    service: ProductService = Depends(_get_product_service),
):
    """List products with optional filters (authenticated users)."""
    items, total = await service.list_all(
        skip=skip,
        limit=limit,
        category_id=category_id,
        ingredient_id=ingredient_id,
        search=search,
        available=available,
        min_price=min_price,
        max_price=max_price,
        min_stock=min_stock,
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    service: ProductService = Depends(_get_product_service),
):
    """Get a single product by ID (authenticated users)."""
    return await service.get_by_id(product_id)


# --- Role-protected endpoints (STAFF or ADMIN) ---


@router.post("", response_model=ProductResponse, status_code=201)
@limiter.limit("30/minute")
async def create_product(
    request: Request,
    data: ProductCreate,
    _: str = Depends(require_role([UserRole.STAFF])),
    session=Depends(get_session),
    service: ProductService = Depends(_get_product_service),
):
    """Create a new product (STAFF, ADMIN)."""
    return await service.create(data, session)


@router.put("/{product_id}", response_model=ProductResponse)
@limiter.limit("30/minute")
async def update_product(
    request: Request,
    product_id: int,
    data: ProductUpdate,
    _: str = Depends(require_role([UserRole.STAFF])),
    session=Depends(get_session),
    service: ProductService = Depends(_get_product_service),
):
    """Update an existing product (STAFF, ADMIN)."""
    return await service.update(product_id, data, session)


@router.delete("/{product_id}", status_code=204)
@limiter.limit("30/minute")
async def delete_product(
    request: Request,
    product_id: int,
    _: str = Depends(require_role([UserRole.STAFF])),
    service: ProductService = Depends(_get_product_service),
):
    """Soft delete a product (STAFF, ADMIN)."""
    await service.soft_delete(product_id)
