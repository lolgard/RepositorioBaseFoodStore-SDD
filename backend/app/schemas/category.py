"""
Category-related Pydantic v2 schemas for request/response validation.
Supports hierarchical category tree with nested children.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""

    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=500)
    parent_id: Optional[int] = Field(default=None)
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=500)
    parent_id: Optional[int] = Field(default=None)
    sort_order: Optional[int] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)


class CategoryResponse(BaseModel):
    """Schema for category data in responses."""

    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CategoryTreeNode(CategoryResponse):
    """Schema for a category node in the tree, with nested children."""

    children: list["CategoryTreeNode"] = Field(default_factory=list)
