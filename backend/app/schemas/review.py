from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


class ReviewCreate(SQLModel):
    """Schema for creating a new review."""

    product_id: int
    rating: int
    comment: Optional[str] = None


class ReviewResponse(SQLModel):
    """Schema for returning a review."""

    id: int
    product_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
