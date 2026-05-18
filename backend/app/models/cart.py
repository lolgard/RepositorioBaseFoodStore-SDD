from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel
from app.models.user import User

class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(foreign_key="cart.id")
    product_id: int = Field(nullable=False)
    name: str = Field(nullable=False)
    price: float = Field(nullable=False)
    quantity: int = Field(default=1, nullable=False)
    excluded_ingredients: str = Field(default="", nullable=False)
    notes: str = Field(default="", nullable=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    cart: Optional["Cart"] = Relationship(back_populates="items")

class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, unique=True)
    coupon_code: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    items: List["CartItem"] = Relationship(back_populates="cart")
    user: Optional["User"] = Relationship()
