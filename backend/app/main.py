"""
FastAPI application entry point.
Configures the app, middleware, exception handlers, and routers.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import (
    AppException,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ValidationError,
    RateLimitError,
)
from app.core.rate_limit import limiter
from app.routers import (
    auth_router,
    categories_router,
    ingredients_router,
    products_router,
    delivery_addresses_router,
    orders_router,
    checkout_router,
    payments_router,
    system_config_router,
    users_router,
    metrics_router,
    notifications_router,
    cart_router,
    coupons_router,
)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title="Food Store API",
        version="1.0.0",
        description="E-commerce platform for food products",
        openapi_url="/api/v1/openapi.json",
        docs_url="/api/v1/docs",
        redoc_url="/api/v1/redoc",
    )

    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rate limiting middleware
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # Register routers
    app.include_router(auth_router)
    app.include_router(categories_router)
    app.include_router(ingredients_router)
    app.include_router(products_router)
    app.include_router(delivery_addresses_router)
    app.include_router(orders_router)
    app.include_router(checkout_router)
    app.include_router(payments_router)
    app.include_router(system_config_router)
    app.include_router(users_router)
    app.include_router(metrics_router)
    app.include_router(notifications_router)
    app.include_router(cart_router)
    app.include_router(coupons_router)

    # Register exception handlers
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """Handle custom application exceptions with RFC 7807 format."""
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        """Handle 404 errors with RFC 7807 format."""
        problem = NotFoundError(resource="Resource").problem
        return JSONResponse(
            status_code=404,
            content=problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(401)
    async def unauthorized_handler(request: Request, exc):
        """Handle 401 errors with RFC 7807 format."""
        problem = UnauthorizedError().problem
        return JSONResponse(
            status_code=401,
            content=problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(403)
    async def forbidden_handler(request: Request, exc):
        """Handle 403 errors with RFC 7807 format."""
        problem = ForbiddenError().problem
        return JSONResponse(
            status_code=403,
            content=problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(422)
    async def validation_error_handler(request: Request, exc):
        """Handle 422 validation errors with RFC 7807 format."""
        problem = ValidationError(detail=str(exc)).problem
        return JSONResponse(
            status_code=422,
            content=problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(429)
    async def rate_limit_handler(request: Request, exc):
        """Handle 429 rate limit errors with RFC 7807 format."""
        problem = RateLimitError().problem
        return JSONResponse(
            status_code=429,
            content=problem.model_dump(exclude_none=True),
        )

    @app.exception_handler(500)
    async def internal_error_handler(request: Request, exc):
        """Handle 500 internal errors with RFC 7807 format."""
        problem = {
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred",
            "instance": str(request.url),
        }
        return JSONResponse(
            status_code=500,
            content=problem,
        )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok", "version": "1.0.0"}

    return app


app = create_app()


@app.on_event("startup")
async def startup_event():
    """Initialize database and create default configs on startup."""
    await init_db()

    from app.core.database import engine, async_session
    from sqlmodel import select
    from app.models.system_config import SystemConfig

    defaults = [
        ("store_name", "FoodStore", "Store display name"),
        ("store_email", "contact@foodstore.com", "Store contact email"),
        ("delivery_fee", "5.00", "Default delivery fee"),
        ("max_addresses_per_user", "5", "Maximum delivery addresses per user"),
        (
            "order_confirmation_message",
            "Your order has been confirmed!",
            "Message shown after order confirmation",
        ),
    ]
    async with async_session() as session:
        for key, value, desc in defaults:
            result = await session.execute(
                select(SystemConfig).where(SystemConfig.key == key)
            )
            existing = result.scalar_one_or_none()
            if not existing:
                session.add(SystemConfig(key=key, value=value, description=desc))
        await session.commit()
