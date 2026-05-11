"""
Pydantic schemas for system configuration API.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ConfigResponse(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: str


class ConfigUpdate(BaseModel):
    value: str
