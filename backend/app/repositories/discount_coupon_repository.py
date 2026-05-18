from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.discount_coupon import DiscountCoupon
from app.repositories.base_repository import BaseRepository

class DiscountCouponRepository(BaseRepository[DiscountCoupon]):
    def __init__(self, session: AsyncSession):
        super().__init__(DiscountCoupon, session)

    async def get_by_code(self, code: str) -> Optional[DiscountCoupon]:
        result = await self.session.execute(
            select(DiscountCoupon).where(DiscountCoupon.code == code)
        )
        return result.scalar_one_or_none()
