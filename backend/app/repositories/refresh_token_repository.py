"""
RefreshToken repository for managing refresh token lifecycle.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import select, update
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    """Repository for RefreshToken operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, token: RefreshToken) -> RefreshToken:
        """Store a new refresh token."""
        self.session.add(token)
        await self.session.flush()
        await self.session.refresh(token)
        return token

    async def find_by_token(self, token_hash: str) -> Optional[RefreshToken]:
        """Find a non-revoked, non-expired refresh token by hash."""
        result = await self.session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,  # noqa: E712
                RefreshToken.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def revoke(self, token_id: int) -> None:
        """Revoke a specific refresh token."""
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.id == token_id)
            .values(is_revoked=True)
        )
        await self.session.flush()

    async def revoke_all_for_user(self, user_id: int) -> None:
        """Revoke ALL refresh tokens for a user (used in theft detection)."""
        await self.session.execute(
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_revoked == False,  # noqa: E712
            )
            .values(is_revoked=True)
        )
        await self.session.flush()
