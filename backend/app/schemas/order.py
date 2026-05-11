"""
Order-related Pydantic v2 schemas.
"""
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    """Schema for an item in the order creation request."""
    product_id: int
    quantity: int = Field(ge=1)
    excluded_ingredients: list[int] = []
    notes: Optional[str] = None


class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    delivery_address_id: int
    items: list[OrderItemInput] = Field(min_length=1)
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    product_name: str
    product_price: str
    quantity: int
    subtotal: str
    excluded_ingredients: list[int] | None
    notes: str | None

    model_config = {"from_attributes": True}


class OrderStatusHistoryResponse(BaseModel):
    id: int
    order_id: int
    from_status: str | None
    to_status: str
    changed_by: int
    reason: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    delivery_address_id: int
    address_snapshot: Any
    subtotal: str
    delivery_cost: str
    total: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = []
    status_history: list[OrderStatusHistoryResponse] = []

    model_config = {"from_attributes": True}


class StatusChangeRequest(BaseModel):
    status: str
    reason: Optional[str] = None


class StatusChangeResponse(OrderResponse):
    """Same shape as OrderResponse but returned on status change."""
    pass
