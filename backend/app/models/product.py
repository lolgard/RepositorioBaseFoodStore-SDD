"""
Product model with many-to-many relationships to Category and Ingredient.
Supports soft delete, stock tracking, and pricing.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Column, Numeric, Text
from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    """Product in the food store catalog."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, sa_type=Text)
    price: Decimal = Field(
        default=None,
        sa_column=Column(Numeric(10, 2), nullable=False),
    )
    stock: int = Field(default=0)
    available: bool = Field(default=True)
    image_url: Optional[str] = Field(default=None, max_length=500)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)


class ProductCategory(SQLModel, table=True):
    """Many-to-many association between products and categories."""

    product_id: int = Field(
        default=None, foreign_key="product.id", primary_key=True,
    )
    category_id: int = Field(
        default=None, foreign_key="category.id", primary_key=True,
    )


class ProductIngredient(SQLModel, table=True):
    """Many-to-many association between products and ingredients."""

    product_id: int = Field(
        default=None, foreign_key="product.id", primary_key=True,
    )
    ingredient_id: int = Field(
        default=None, foreign_key="ingredient.id", primary_key=True,
    )
