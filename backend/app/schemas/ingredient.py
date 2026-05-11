"""
Ingredient-related Pydantic v2 schemas for request/response validation.
Supports allergen filtering and CRUD operations.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IngredientCreate(BaseModel):
    """Schema for creating a new ingredient."""

    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    es_alergeno: bool = Field(default=False)


class IngredientUpdate(BaseModel):
    """Schema for updating an existing ingredient."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    es_alergeno: Optional[bool] = Field(default=None)


class IngredientResponse(BaseModel):
    """Schema for ingredient data in responses."""

    id: int
    name: str
    description: Optional[str] = None
    es_alergeno: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
