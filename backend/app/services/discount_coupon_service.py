from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.discount_coupon_repository import DiscountCouponRepository
from app.models.discount_coupon import DiscountCoupon
from datetime import datetime

class DiscountCouponService:
    def __init__(self, session: AsyncSession):
        self.repository = DiscountCouponRepository(session)

    async def validate_coupon(self, code: str) -> Optional[DiscountCoupon]:
        coupon = await self.repository.get_by_code(code)
        if not coupon or not coupon.is_active:
            return None
        
        if coupon.expiration_date and coupon.expiration_date < datetime.utcnow():
            return None
            
        return coupon
