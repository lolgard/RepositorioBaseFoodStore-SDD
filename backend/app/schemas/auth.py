"""
Auth-related Pydantic v2 schemas for request/response validation.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=20)


class UserLogin(BaseModel):
    """Schema for login request."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user data in responses (excludes password_hash)."""

    id: int
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    role: str
    is_active: bool
    image_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Schema for token response on login/refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    """Schema for registration response."""

    message: str
    user: UserResponse


class RefreshRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str


class ProfileUpdate(BaseModel):
    """Schema for profile update request. All fields optional."""

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    image_url: str | None = Field(default=None, max_length=500)


class PasswordChangeRequest(BaseModel):
    """Schema for password change request."""

    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class PasswordChangeResponse(BaseModel):
    """Schema for password change response."""

    message: str
