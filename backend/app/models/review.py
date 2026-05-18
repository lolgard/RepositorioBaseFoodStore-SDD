from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class ProductReview(SQLModel, table=True):
    """Product review and rating."""

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", nullable=False)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    rating: int = Field(ge=1, le=5, nullable=False)
    comment: Optional[str] = Field(default=None, max_length=1000)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)
