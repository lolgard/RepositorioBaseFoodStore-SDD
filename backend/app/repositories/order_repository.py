"""
Order repository.
"""
from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Repository for Order operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    async def get_all(self) -> list[Order]:
        """Get all non-deleted orders, newest first."""
        result = await self.session.execute(
            select(Order)
            .where(Order.deleted_at == None)
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_user(self, user_id: int) -> list[Order]:
        """Get all non-deleted orders for a user."""
        result = await self.session.execute(
            select(Order)
            .where(Order.user_id == user_id, Order.deleted_at == None)
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id_with_ownership(self, order_id: int, user_id: int, is_staff: bool = False) -> Optional[Order]:
        """Get order by ID. Staff can see any order, users only their own."""
        query = select(Order).where(Order.id == order_id, Order.deleted_at == None)
        if not is_staff:
            query = query.where(Order.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_items_by_order(self, order_id: int) -> list[OrderItem]:
        result = await self.session.execute(
            select(OrderItem).where(OrderItem.order_id == order_id)
        )
        return list(result.scalars().all())

    async def get_history_by_order(self, order_id: int) -> list[OrderStatusHistory]:
        result = await self.session.execute(
            select(OrderStatusHistory).where(OrderStatusHistory.order_id == order_id)
            .order_by(OrderStatusHistory.created_at.asc())
        )
        return list(result.scalars().all())

    async def create_order_item(self, item: OrderItem) -> OrderItem:
        self.session.add(item)
        await self.session.flush()
        await self.session.refresh(item)
        return item

    async def create_status_history(self, entry: OrderStatusHistory) -> OrderStatusHistory:
        self.session.add(entry)
        await self.session.flush()
        await self.session.refresh(entry)
        return entry
