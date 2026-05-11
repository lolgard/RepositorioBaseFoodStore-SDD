"""
Delivery address Pydantic v2 schemas for request/response validation.
"""
from datetime import datetime

from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    """Schema for creating a new delivery address."""

    street: str = Field(min_length=1, max_length=200)
    street_number: str = Field(min_length=1, max_length=20)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    zip_code: str = Field(min_length=1, max_length=20)
    country: str = Field(default="Argentina", max_length=100)
    is_default: bool = False
    additional_info: str | None = Field(default=None, max_length=200)


class AddressUpdate(BaseModel):
    """Schema for updating an existing delivery address."""

    street: str | None = Field(default=None, min_length=1, max_length=200)
    street_number: str | None = Field(default=None, min_length=1, max_length=20)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, min_length=1, max_length=100)
    zip_code: str | None = Field(default=None, min_length=1, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    is_default: bool | None = None
    additional_info: str | None = None


class AddressResponse(BaseModel):
    """Schema for delivery address data in responses."""

    id: int
    user_id: int
    street: str
    street_number: str
    city: str
    state: str
    zip_code: str
    country: str
    is_default: bool
    additional_info: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
