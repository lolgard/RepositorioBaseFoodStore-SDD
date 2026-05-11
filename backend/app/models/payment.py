from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, Integer, String, Text, DateTime, Numeric, ForeignKey
from decimal import Decimal


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(sa_column=Column(Integer, ForeignKey("orders.id"), nullable=False, index=True))
    mp_preference_id: Optional[str] = Field(sa_column=Column(String(100)), default=None)
    mp_payment_id: Optional[str] = Field(sa_column=Column(String(100)), default=None)
    status: str = Field(sa_column=Column(String(20), nullable=False, default="pending"))
    status_detail: Optional[str] = Field(sa_column=Column(Text), default=None)
    transaction_amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    payer_email: Optional[str] = Field(sa_column=Column(String(200)), default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
