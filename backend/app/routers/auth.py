"""
Auth router: registration, login, token refresh, logout, and profile.
"""
from fastapi import APIRouter, Depends, Request

from app.core.database import get_session
from app.core.rate_limit import limiter
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.routers.dependencies import get_current_user_id
from app.schemas.auth import (
    RefreshRequest,
    RegisterResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _get_auth_service(session=Depends(get_session)) -> AuthService:
    """Dependency: create AuthService with repositories."""
    return AuthService(
        user_repo=UserRepository(session),
        refresh_token_repo=RefreshTokenRepository(session),
    )


@router.post("/register", status_code=201)
@limiter.limit("3/hour")
async def register(
    request: Request,
    data: UserCreate,
    auth_service: AuthService = Depends(_get_auth_service),
):
    """Register a new customer account."""
    user, access_token, refresh_token = await auth_service.register(data)
    return RegisterResponse(
        message="Registration successful",
        user=UserResponse.model_validate(user),
    )


@router.post("/login")
@limiter.limit("5/15minutes")
async def login(
    request: Request,
    data: UserLogin,
    auth_service: AuthService = Depends(_get_auth_service),
):
    """Authenticate and return JWT tokens."""
    user, access_token, refresh_token = await auth_service.login(data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh")
async def refresh(
    data: RefreshRequest,
    auth_service: AuthService = Depends(_get_auth_service),
):
    """Refresh access token using a refresh token (with rotation)."""
    user, access_token, new_refresh_token = await auth_service.refresh_token(
        data.refresh_token
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout(
    data: RefreshRequest,
    auth_service: AuthService = Depends(_get_auth_service),
):
    """Logout: revoke the refresh token."""
    await auth_service.logout(data.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(
    user_id: int = Depends(get_current_user_id),
    auth_service: AuthService = Depends(_get_auth_service),
):
    """Get the currently authenticated user's profile."""
    user = await auth_service.get_current_user(user_id)
    return UserResponse.model_validate(user)
