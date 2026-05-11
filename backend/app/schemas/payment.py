from datetime import datetime
from decimal import Decimal
from typing import Optional, Any
from pydantic import BaseModel


class CreatePreferenceRequest(BaseModel):
    order_id: int


class CreatePreferenceResponse(BaseModel):
    preference_id: str
    init_point: str
    order_id: int


class WebhookPayload(BaseModel):
    type: str
    data: dict[str, Any]


class PaymentStatusResponse(BaseModel):
    order_id: int
    payment_id: Optional[str] = None
    status: str
    status_detail: Optional[str] = None
    transaction_amount: str
    created_at: datetime
