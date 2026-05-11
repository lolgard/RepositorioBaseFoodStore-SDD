"""
Ingredient model for tracking product components and allergens.
Supports soft delete for data preservation.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Ingredient(SQLModel, table=True):
    """Product ingredient with allergen tracking."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False, unique=True)
    description: Optional[str] = Field(default=None, max_length=500)
    es_alergeno: bool = Field(default=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)
