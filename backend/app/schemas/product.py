"""
Product-related Pydantic v2 schemas for request/response validation.
Supports CRUD operations with category and ingredient associations.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_serializer, field_validator


class ProductCreate(BaseModel):
    """Schema for creating a new product."""

    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    price: Decimal = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    available: bool = Field(default=True)
    image_url: Optional[str] = Field(default=None, max_length=500)
    category_ids: list[int] = Field(default_factory=list)
    ingredient_ids: list[int] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    price: Optional[Decimal] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    available: Optional[bool] = Field(default=None)
    image_url: Optional[str] = Field(default=None, max_length=500)
    category_ids: Optional[list[int]] = Field(default=None)
    ingredient_ids: Optional[list[int]] = Field(default=None)


class ProductResponse(BaseModel):
    """Schema for product data in responses."""

    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    available: bool
    image_url: Optional[str] = None
    category_ids: list[int] = Field(default_factory=list)
    ingredient_ids: list[int] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_serializer("price")
    @classmethod
    def serialize_price(cls, value: Decimal) -> str:
        return str(value)

    @field_validator("price", mode="before")
    @classmethod
    def coerce_price(cls, v):
        if isinstance(v, Decimal):
            return str(v)
        return v
