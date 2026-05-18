"""
Review service.
"""
from typing import List

from app.models.review import ProductReview
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewResponse


class ReviewService:
    """Service for review management operations."""

    def __init__(self, review_repo: ReviewRepository):
        self.review_repo = review_repo

    async def create(
        self, product_id: int, user_id: int, data: ReviewCreate
    ) -> ReviewResponse:
        """Create a new review."""
        review = ProductReview(
            product_id=product_id,
            user_id=user_id,
            rating=data.rating,
            comment=data.comment,
        )
        created = await self.review_repo.create(review)
        return ReviewResponse.model_validate(created)

    async def list_by_product(self, product_id: int) -> List[ReviewResponse]:
        """List reviews for a product."""
        reviews = await self.review_repo.list_by_product(product_id)
        return [ReviewResponse.model_validate(r) for r in reviews]
