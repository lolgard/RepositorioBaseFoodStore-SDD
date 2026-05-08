"""
User repository extending BaseRepository with auth-specific queries.
"""
from typing import Optional

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email. Excludes soft-deleted."""
        result = await self.session.execute(
            select(User).where(
                User.email == email,
                User.deleted_at == None,  # noqa: E711
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, id: int) -> Optional[User]:
        """Get user by ID. Excludes soft-deleted."""
        return await super().get_by_id(id)

    async def create(self, user: User) -> User:
        """Create a new user."""
        return await super().create(user)
