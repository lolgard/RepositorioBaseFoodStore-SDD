"""API routers for Food Store."""
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router

__all__ = ["auth_router", "categories_router"]
