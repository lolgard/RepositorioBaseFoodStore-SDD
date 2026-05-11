"""API routers for Food Store."""
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.ingredients import router as ingredients_router
from app.routers.products import router as products_router
from app.routers.delivery_addresses import router as delivery_addresses_router
from app.routers.orders import router as orders_router
from app.routers.checkout import router as checkout_router
from app.routers.payments import router as payments_router
from app.routers.system_config import router as system_config_router
from app.routers.users import router as users_router
from app.routers.metrics import router as metrics_router

__all__ = ["auth_router", "categories_router", "ingredients_router", "products_router", "delivery_addresses_router", "orders_router", "checkout_router", "payments_router", "system_config_router", "users_router", "metrics_router"]
