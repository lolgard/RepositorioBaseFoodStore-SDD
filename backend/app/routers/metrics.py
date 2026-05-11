from fastapi import APIRouter, Depends, Query
from app.core.database import get_session
from app.routers.dependencies import require_role
from app.models.user import UserRole
from app.services.metrics_service import MetricsService

router = APIRouter(prefix="/api/v1/admin/metrics", tags=["metrics"])


@router.get("/summary")
async def get_summary(
    _=Depends(require_role([UserRole.ADMIN])),
    session=Depends(get_session),
):
    service = MetricsService(session)
    return await service.get_summary()


@router.get("/sales-evolution")
async def get_sales_evolution(
    days: int = Query(default=30, ge=1, le=365),
    _=Depends(require_role([UserRole.ADMIN])),
    session=Depends(get_session),
):
    service = MetricsService(session)
    return await service.get_sales_evolution(days)


@router.get("/top-products")
async def get_top_products(
    limit: int = Query(default=10, ge=1, le=100),
    _=Depends(require_role([UserRole.ADMIN])),
    session=Depends(get_session),
):
    service = MetricsService(session)
    return await service.get_top_products(limit)


@router.get("/orders-by-status")
async def get_orders_by_status(
    _=Depends(require_role([UserRole.ADMIN])),
    session=Depends(get_session),
):
    service = MetricsService(session)
    return await service.get_orders_by_status()
