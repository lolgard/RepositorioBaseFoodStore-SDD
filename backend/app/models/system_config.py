"""
SystemConfig model for key-value configuration storage.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, Integer, String, Text, DateTime


class SystemConfig(SQLModel, table=True):
    __tablename__ = "system_configs"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(sa_column=Column(String(100), unique=True, nullable=False, index=True))
    value: str = Field(sa_column=Column(Text, nullable=False, default=""))
    description: Optional[str] = Field(sa_column=Column(Text), default=None)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
