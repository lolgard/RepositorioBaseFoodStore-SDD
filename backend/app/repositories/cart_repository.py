from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.cart import Cart
from app.repositories.base_repository import BaseRepository

class CartRepository(BaseRepository[Cart]):
    def __init__(self, session: AsyncSession):
        super().__init__(Cart, session)

    async def get_by_user_id(self, user_id: int) -> Optional[Cart]:
        result = await self.session.execute(
            select(Cart).where(Cart.user_id == user_id)
        )
        return result.scalar_one_or_none()
