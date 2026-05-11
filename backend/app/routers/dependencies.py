"""
FastAPI dependencies for authentication and authorization.
"""
from typing import List, Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.models.user import User, UserRole

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


async def get_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """
    Extract and validate the JWT payload from the Authorization header.
    Raises 401 if token is missing, invalid, or expired.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        if payload.get("type") != "access":
            raise UnauthorizedError("Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")


async def get_current_user_id(payload: dict = Depends(get_token_payload)) -> int:
    """Extract user ID from the JWT payload."""
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token: no user ID")
    return int(user_id)


async def get_current_user_role(payload: dict = Depends(get_token_payload)) -> str:
    """Extract the user's role from the JWT payload."""
    role = payload.get("role")
    if not role:
        raise UnauthorizedError("Invalid token: no role")
    return role


async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> User:
    """Get the current authenticated user from the database."""
    result = await session.execute(
        select(User).where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")
    if not user.is_active:
        raise UnauthorizedError("User is deactivated")
    return user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory: returns a dependency that checks if the user's role
    is in the allowed list. Admin always passes (bypass).
    """

    async def role_checker(role: str = Depends(get_current_user_role)) -> str:
        # Admin bypass
        if role == UserRole.ADMIN.value:
            return role

        if role not in [r.value for r in allowed_roles]:
            raise ForbiddenError(
                f"Requires one of: {', '.join(r.value for r in allowed_roles)}"
            )
        return role

    return role_checker
