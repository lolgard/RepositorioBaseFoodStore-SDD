from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.services.discount_coupon_service import DiscountCouponService
from app.schemas.discount_coupon import DiscountCouponResponse

router = APIRouter(prefix="/coupons", tags=["coupons"])

@router.get("/{code}/validate", response_model=DiscountCouponResponse)
async def validate_coupon(code: str, session: AsyncSession = Depends(get_session)):
    service = DiscountCouponService(session)
    coupon = await service.validate_coupon(code)
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found or invalid"
        )
    return coupon
