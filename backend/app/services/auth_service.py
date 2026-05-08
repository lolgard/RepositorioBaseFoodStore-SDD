"""
Authentication service.
Handles registration, login, JWT tokens, refresh rotation, and logout.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    UnauthorizedError,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserRole
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

# Password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication operations."""

    def __init__(
        self,
        user_repo: UserRepository,
        refresh_token_repo: RefreshTokenRepository,
    ):
        self.user_repo = user_repo
        self.refresh_token_repo = refresh_token_repo

    # --- Password helpers ---

    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    # --- JWT helpers ---

    def _create_access_token(self, user_id: int, role: str) -> str:
        """Create a short-lived JWT access token."""
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = {
            "sub": str(user_id),
            "role": role,
            "type": "access",
            "exp": expire,
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def _create_refresh_token_value(self) -> str:
        """Generate a cryptographically secure random refresh token."""
        return secrets.token_urlsafe(64)

    def _hash_token(self, token: str) -> str:
        """Hash a token for secure storage (SHA-256)."""
        return hashlib.sha256(token.encode()).hexdigest()

    def _decode_access_token(self, token: str) -> dict:
        """Decode and validate a JWT access token."""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            if payload.get("type") != "access":
                raise UnauthorizedError("Invalid token type")
            return payload
        except JWTError:
            raise UnauthorizedError("Invalid or expired access token")

    # --- Core auth operations ---

    async def register(self, data: UserCreate) -> tuple[User, str]:
        """
        Register a new user.
        Returns (user, plain_text_refresh_token).
        """
        # Check for duplicate email
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictError("Email is already registered")

        # Create user
        user = User(
            email=data.email,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            password_hash=self._hash_password(data.password),
            role=UserRole.CLIENTE,
            is_active=True,
        )
        created_user = await self.user_repo.create(user)

        # Generate tokens
        access_token = self._create_access_token(created_user.id, created_user.role.value)
        refresh_token_value = self._create_refresh_token_value()
        await self._store_refresh_token(created_user.id, refresh_token_value)

        return created_user, access_token, refresh_token_value

    async def login(self, data: UserLogin) -> tuple[User, str, str]:
        """
        Authenticate a user and return tokens.
        Returns (user, access_token, refresh_token).
        """
        user = await self.user_repo.get_by_email(data.email)

        if not user or not self._verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        if not user.is_active:
            raise ForbiddenError("Account is disabled")

        # Generate tokens
        access_token = self._create_access_token(user.id, user.role.value)
        refresh_token_value = self._create_refresh_token_value()
        await self._store_refresh_token(user.id, refresh_token_value)

        return user, access_token, refresh_token_value

    async def refresh_token(
        self, current_refresh_token: str
    ) -> tuple[User, str, str]:
        """
        Refresh an access token using a refresh token (with rotation).
        If the refresh token was already used (reuse detection),
        ALL tokens for that user are revoked (theft mitigation).

        Returns (user, new_access_token, new_refresh_token).
        """
        token_hash = self._hash_token(current_refresh_token)
        stored_token = await self.refresh_token_repo.find_by_token(token_hash)

        if not stored_token:
            # Token might have been already rotated (reuse detection)
            # Try to find by hash even if revoked to detect theft
            revoked_token = await self._find_revoked_token(token_hash)
            if revoked_token:
                # THEFT DETECTED: revoke ALL tokens for this user
                await self.refresh_token_repo.revoke_all_for_user(
                    revoked_token.user_id
                )
            raise UnauthorizedError("Invalid or expired refresh token")

        # Revoke the current refresh token (rotation)
        await self.refresh_token_repo.revoke(stored_token.id)

        # Get the user
        user = await self.user_repo.get_by_id(stored_token.user_id)
        if not user or not user.is_active:
            raise ForbiddenError("Account is disabled or not found")

        # Issue new tokens
        access_token = self._create_access_token(user.id, user.role.value)
        new_refresh_token = self._create_refresh_token_value()
        await self._store_refresh_token(user.id, new_refresh_token)

        return user, access_token, new_refresh_token

    async def logout(self, refresh_token: str) -> None:
        """Logout by revoking the given refresh token."""
        token_hash = self._hash_token(refresh_token)
        stored_token = await self.refresh_token_repo.find_by_token(token_hash)

        if stored_token:
            await self.refresh_token_repo.revoke(stored_token.id)

        # Idempotent: if token not found, still return success
        return None

    async def get_current_user(self, user_id: int) -> User:
        """Get user by ID. Raises if not found or inactive."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedError("User not found")
        if not user.is_active:
            raise ForbiddenError("Account is disabled")
        return user

    # --- Internal helpers ---

    async def _store_refresh_token(self, user_id: int, token_value: str) -> None:
        """Create and store a refresh token record."""
        expires_at = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        token = RefreshToken(
            token_hash=self._hash_token(token_value),
            user_id=user_id,
            expires_at=expires_at,
        )
        await self.refresh_token_repo.create(token)

    async def _find_revoked_token(self, token_hash: str) -> Optional[RefreshToken]:
        """Find a revoked refresh token by hash (for theft detection)."""
        from sqlmodel import select

        result = await self.refresh_token_repo.session.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()
