"""
DeliveryAddress model for storing user delivery addresses.
Supports soft delete and default address flagging.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DeliveryAddress(SQLModel, table=True):
    """User delivery address."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
    street: str = Field(max_length=200, nullable=False)
    street_number: str = Field(max_length=20, nullable=False)
    city: str = Field(max_length=100, nullable=False)
    state: str = Field(max_length=100, nullable=False)
    zip_code: str = Field(max_length=20, nullable=False)
    country: str = Field(default="Argentina", max_length=100)
    is_default: bool = Field(default=False)
    additional_info: Optional[str] = Field(default=None, max_length=200)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)
