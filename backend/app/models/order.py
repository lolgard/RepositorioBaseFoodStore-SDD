"""
Order model with status lifecycle.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Any
from sqlmodel import Field, SQLModel, Column, JSON, Integer, Numeric, String, Text, DateTime, ForeignKey


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column=Column(Integer, ForeignKey("user.id"), nullable=False, index=True))
    status: str = Field(sa_column=Column(String(20), nullable=False, default="PENDING"))
    delivery_address_id: int = Field(sa_column=Column(Integer, ForeignKey("deliveryaddress.id"), nullable=False))
    address_snapshot: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    subtotal: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    delivery_cost: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False, default=0))
    total: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    notes: Optional[str] = Field(sa_column=Column(Text), default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
    deleted_at: Optional[datetime] = Field(default=None)


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(sa_column=Column(Integer, ForeignKey("orders.id"), nullable=False, index=True))
    product_id: int = Field(sa_column=Column(Integer, ForeignKey("product.id"), nullable=False))
    product_name: str = Field(sa_column=Column(String(200), nullable=False))
    product_price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    quantity: int = Field(sa_column=Column(Integer, nullable=False))
    subtotal: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    excluded_ingredients: Optional[list[int]] = Field(sa_column=Column(JSON), default=None)
    notes: Optional[str] = Field(sa_column=Column(Text), default=None)


class OrderStatusHistory(SQLModel, table=True):
    __tablename__ = "order_status_history"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(sa_column=Column(Integer, ForeignKey("orders.id"), nullable=False, index=True))
    from_status: Optional[str] = Field(sa_column=Column(String(20)), default=None)
    to_status: str = Field(sa_column=Column(String(20), nullable=False))
    changed_by: int = Field(sa_column=Column(Integer, ForeignKey("user.id"), nullable=False))
    reason: Optional[str] = Field(sa_column=Column(Text), default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
