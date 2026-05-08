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
    ConflictError,
    RateLimitError,
)
from app.core.rate_limit import limiter
from app.routers import auth_router, categories_router


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
    """Initialize database on startup."""
    await init_db()
