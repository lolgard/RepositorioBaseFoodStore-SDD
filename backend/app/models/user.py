"""
User model with SQLModel.
Supports soft delete and role-based access control.
"""
import enum
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class UserRole(str, enum.Enum):
    """RBAC roles with hierarchical permissions."""

    CLIENTE = "CLIENTE"
    STAFF = "STAFF"
    GESTOR = "GESTOR"
    ADMIN = "ADMIN"


class User(SQLModel, table=True):
    """User account model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    password_hash: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.CLIENTE)
    is_active: bool = Field(default=True)
    image_url: Optional[str] = Field(default=None, max_length=500)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Soft delete
    deleted_at: Optional[datetime] = Field(default=None)
