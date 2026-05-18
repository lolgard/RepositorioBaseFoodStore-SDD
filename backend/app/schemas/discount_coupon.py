from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class DiscountCouponCreate(BaseModel):
    code: str
    discount_percentage: float
    is_active: bool = True
    expiration_date: Optional[datetime] = None

class DiscountCouponResponse(BaseModel):
    id: int
    code: str
    discount_percentage: float
    is_active: bool
    expiration_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
