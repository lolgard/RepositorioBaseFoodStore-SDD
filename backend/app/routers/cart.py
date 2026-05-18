from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession


from app.core.database import get_session
from app.routers.dependencies import get_current_user
from app.models.user import User
from app.schemas.cart import CartResponse, CartSyncRequest
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
async def read_cart(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service = CartService(db)
    return await service.get_cart(current_user.id)


@router.post("/sync", response_model=CartResponse)
async def sync_cart(
    sync_request: CartSyncRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service = CartService(db)
    return await service.sync_cart(current_user.id, sync_request.items)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    service = CartService(db)
    await service.delete_cart(current_user.id)
