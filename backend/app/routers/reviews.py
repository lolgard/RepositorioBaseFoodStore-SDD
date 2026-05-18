"""
Reviews router: creating and listing product reviews.
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.repositories.review_repository import ReviewRepository
from app.routers.dependencies import get_current_user_id
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/api/v1/reviews", tags=["reviews"])


def _get_review_service(
    session: AsyncSession = Depends(get_session),
) -> ReviewService:
    """Dependency: create ReviewService."""
    return ReviewService(review_repo=ReviewRepository(session))


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    data: ReviewCreate,
    user_id: int = Depends(get_current_user_id),
    service: ReviewService = Depends(_get_review_service),
):
    """Create a new product review."""
    return await service.create(data.product_id, user_id, data)
