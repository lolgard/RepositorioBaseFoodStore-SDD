"""
Base Pydantic v2 schemas for request/response validation.
Provides generic base classes for Create, Update, and Read operations.
"""
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class CreateSchema(BaseSchema):
    """
    Base schema for create operations.
    Excludes id, created_at, updated_at, etc.
    """


class UpdateSchema(BaseSchema):
    """
    Base schema for update operations.
    All fields are optional to allow partial updates.
    """

    model_config = ConfigDict(extra="ignore")


class ReadSchema(BaseSchema):
    """
    Base schema for read operations.
    Includes id and timestamps.
    Should exclude sensitive fields like password hashes.
    """

    id: int
