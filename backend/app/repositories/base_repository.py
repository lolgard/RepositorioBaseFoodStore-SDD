"""
Generic BaseRepository[T] for common CRUD operations.
Parametrized with a SQLModel type.
"""
from typing import Generic, List, Optional, Type, TypeVar

from sqlmodel import SQLModel, select, delete
from sqlmodel.ext.asyncio.session import AsyncSession

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Base repository with common CRUD operations."""

    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID. Excludes soft-deleted by default."""
        result = await self.session.execute(
            select(self.model).where(
                self.model.id == id,
                self.model.eliminado_en == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def list_all(
        self, skip: int = 0, limit: int = 100, filters: Optional[dict] = None
    ) -> List[T]:
        """List entities with pagination. Excludes soft-deleted."""
        query = select(self.model).where(self.model.eliminado_en == None)  # noqa: E711

        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self, filters: Optional[dict] = None) -> int:
        """Count entities. Excludes soft-deleted."""
        query = select(self.model).where(self.model.eliminado_en == None)  # noqa: E711

        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)

        result = await self.session.execute(query)
        return len(list(result.scalars().all()))

    async def create(self, obj: T) -> T:
        """Create a new entity. Returns entity with ID."""
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, id: int, data: dict) -> Optional[T]:
        """Update entity by ID. Returns updated entity."""
        obj = await self.get_by_id(id)
        if not obj:
            return None

        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)

        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def soft_delete(self, id: int) -> bool:
        """Soft delete entity by setting eliminado_en."""
        obj = await self.get_by_id(id)
        if not obj:
            return False

        from datetime import datetime, timezone
        obj.eliminado_en = datetime.now(timezone.utc)
        await self.session.flush()
        return True

    async def hard_delete(self, id: int) -> bool:
        """Hard delete entity (use with caution)."""
        statement = delete(self.model).where(self.model.id == id)
        result = await self.session.execute(statement)
        await self.session.flush()
        return result.rowcount > 0
