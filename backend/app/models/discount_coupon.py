from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class DiscountCoupon(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(nullable=False, unique=True, index=True)
    discount_percentage: float = Field(nullable=False)
    is_active: bool = Field(default=True)
    expiration_date: Optional[datetime] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )
