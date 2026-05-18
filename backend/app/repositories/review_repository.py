"""
Review repository for CRUD operations on product reviews.
"""
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.review import ProductReview
from app.repositories.base_repository import BaseRepository


class ReviewRepository(BaseRepository[ProductReview]):
    """Repository for Review operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(ProductReview, session)

    async def list_by_product(self, product_id: int) -> List[ProductReview]:
        """List reviews for a specific product."""
        query = (
            select(ProductReview)
            .where(
                ProductReview.product_id == product_id,
                ProductReview.deleted_at.is_(None),
            )
            .order_by(ProductReview.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
