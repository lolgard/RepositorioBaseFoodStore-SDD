"""
RefreshToken model for JWT refresh token tracking.
Supports rotation and theft detection.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class RefreshToken(SQLModel, table=True):
    """Stores refresh token hashes for validation and rotation."""

    id: Optional[int] = Field(default=None, primary_key=True)
    token_hash: str = Field(index=True, max_length=128)
    user_id: int = Field(foreign_key="user.id", index=True)
    expires_at: datetime
    is_revoked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
