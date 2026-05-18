from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import delete
from app.models.cart import CartItem
from app.repositories.base_repository import BaseRepository

class CartItemRepository(BaseRepository[CartItem]):
    def __init__(self, session: AsyncSession):
        super().__init__(CartItem, session)

    async def delete_by_cart_id(self, cart_id: int):
        statement = delete(CartItem).where(CartItem.cart_id == cart_id)
        await self.session.execute(statement)
        await self.session.flush()
