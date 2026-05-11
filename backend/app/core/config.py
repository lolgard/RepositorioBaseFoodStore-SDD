"""
Configuration management using Pydantic Settings.
Loads environment variables from .env file.
"""
from typing import Any, Dict, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/foodstore"

    # Security
    SECRET_KEY: str = "change-me-in-production!"
    ALGORITHM: str = "HS256"

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Rate limiting
    RATE_LIMIT_LOGIN_CALLS: int = 5
    RATE_LIMIT_LOGIN_PERIOD: int = 900  # 15 minutes in seconds

    # App
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    APP_URL: str = "http://localhost:5173"
    API_URL: str = "http://localhost:8000"

    # MercadoPago
    MERCADOPAGO_ACCESS_TOKEN: str = ""


settings = Settings()
