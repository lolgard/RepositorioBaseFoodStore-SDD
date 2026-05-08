"""
Category model with hierarchical parent-child support.
Uses a self-referencing foreign key for tree structure
and soft delete for data preservation.
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    """Product category with hierarchical support."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    description: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=500)
    parent_id: Optional[int] = Field(
        default=None,
        foreign_key="category.id",
        index=True,
    )
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)

    # Self-referencing relationship
    # `remote_side` goes on the many-to-one side (parent) only
    children: List["Category"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={
            "foreign_keys": "Category.parent_id",
        },
    )
    parent: Optional["Category"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={
            "foreign_keys": "Category.parent_id",
            "remote_side": "Category.id",
        },
    )
