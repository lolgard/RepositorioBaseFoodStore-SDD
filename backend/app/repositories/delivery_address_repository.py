"""
DeliveryAddress repository.
"""
from typing import Optional

from sqlmodel import select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.delivery_address import DeliveryAddress
from app.repositories.base_repository import BaseRepository


class DeliveryAddressRepository(BaseRepository[DeliveryAddress]):
    """Repository for DeliveryAddress operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(DeliveryAddress, session)

    async def get_by_user(self, user_id: int) -> list[DeliveryAddress]:
        """Get all non-deleted addresses for a user, default first then by updated_at desc."""
        result = await self.session.execute(
            select(DeliveryAddress)
            .where(
                DeliveryAddress.user_id == user_id,
                DeliveryAddress.deleted_at == None,
            )
            .order_by(DeliveryAddress.is_default.desc(), DeliveryAddress.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_user_and_id(self, user_id: int, address_id: int) -> Optional[DeliveryAddress]:
        """Get a specific address by ID, ensuring ownership."""
        result = await self.session.execute(
            select(DeliveryAddress).where(
                DeliveryAddress.id == address_id,
                DeliveryAddress.user_id == user_id,
                DeliveryAddress.deleted_at == None,
            )
        )
        return result.scalar_one_or_none()

    async def count_by_user(self, user_id: int) -> int:
        """Count non-deleted addresses for a user."""
        result = await self.session.execute(
            select(DeliveryAddress).where(
                DeliveryAddress.user_id == user_id,
                DeliveryAddress.deleted_at == None,
            )
        )
        return len(list(result.scalars().all()))

    async def unset_default_for_user(self, user_id: int) -> None:
        """Unset default for all addresses of a user."""
        await self.session.execute(
            update(DeliveryAddress)
            .where(
                DeliveryAddress.user_id == user_id,
                DeliveryAddress.is_default == True,
            )
            .values(is_default=False)
        )
        await self.session.flush()
