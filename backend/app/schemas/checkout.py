"""
Schemas for pre-checkout validation.
"""
from typing import Optional
from pydantic import BaseModel, Field


class CheckoutItem(BaseModel):
    """An item from the cart to validate."""
    product_id: int
    quantity: int = Field(ge=1)
    expected_price: Optional[str] = None


class CheckoutValidationRequest(BaseModel):
    """Request to validate cart items before checkout."""
    items: list[CheckoutItem] = Field(min_length=1)


class CheckoutIssue(BaseModel):
    """An issue found during validation."""
    type: str  # stock_changed, price_changed, product_unavailable, product_not_found
    product_id: int
    product_name: str
    message: str
    requested: Optional[int] = None
    available: Optional[int] = None
    expected_price: Optional[str] = None
    current_price: Optional[str] = None


class CheckoutValidationResponse(BaseModel):
    """Result of pre-checkout validation."""
    valid: bool
    issues: list[CheckoutIssue] = []
