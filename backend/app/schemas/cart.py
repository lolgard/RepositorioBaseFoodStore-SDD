from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CartItemCreate(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    excluded_ingredients: List[int] = Field(default_factory=list)
    notes: str = ""

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    name: str
    price: float
    quantity: int
    excluded_ingredients: str # Will need to be parsed
    notes: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class CartSyncRequest(BaseModel):
    items: List[CartItemCreate]
