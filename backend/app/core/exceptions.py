"""
RFC 7807 Problem Detail Model and custom exception classes.
Provides standardized error responses across the API.
"""
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ProblemDetail(BaseModel):
    """
    RFC 7807 Problem Detail JSON object.
    Used for standardized error responses.
    """

    type: str = "about:blank"
    title: str
    status: int
    detail: Optional[str] = None
    instance: Optional[str] = None

    model_config = {"json_encoders": {}}


class AppException(Exception):
    """Base application exception with RFC 7807 support."""

    def __init__(
        self,
        status_code: int,
        title: str,
        detail: Optional[str] = None,
        type_: str = "about:blank",
        instance: Optional[str] = None,
    ):
        self.status_code = status_code
        self.problem = ProblemDetail(
            type=type_,
            title=title,
            status=status_code,
            detail=detail,
            instance=instance,
        )
        super().__init__(detail)


class NotFoundError(AppException):
    """Resource not found."""

    def __init__(self, resource: str, identifier: Any = None):
        detail = f"{resource} not found"
        if identifier:
            detail += f" (id={identifier})"
        super().__init__(
            status_code=404,
            title="Not Found",
            detail=detail,
            type_=f"https://example.com/probs/not-found",
        )


class UnauthorizedError(AppException):
    """Authentication required."""

    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=401,
            title="Unauthorized",
            detail=detail,
            type_=f"https://example.com/probs/unauthorized",
        )


class ForbiddenError(AppException):
    """Permission denied."""

    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=403,
            title="Forbidden",
            detail=detail,
            type_=f"https://example.com/probs/forbidden",
        )


class ValidationError(AppException):
    """Validation failed."""

    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=422,
            title="Validation Error",
            detail=detail,
            type_=f"https://example.com/probs/validation-error",
        )


class BadRequestError(AppException):
    """Bad request (e.g., validation business rule)."""

    def __init__(self, detail: str = "Bad request"):
        super().__init__(
            status_code=400,
            title="Bad Request",
            detail=detail,
            type_=f"https://example.com/probs/bad-request",
        )


class ConflictError(AppException):
    """Resource conflict (e.g., duplicate)."""

    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(
            status_code=409,
            title="Conflict",
            detail=detail,
            type_=f"https://example.com/probs/conflict",
        )


class RateLimitError(AppException):
    """Rate limit exceeded."""

    def __init__(self, detail: str = "Rate limit exceeded", retry_after: int = 900):
        self.retry_after = retry_after
        super().__init__(
            status_code=429,
            title="Too Many Requests",
            detail=detail,
            type_=f"https://example.com/probs/rate-limit",
        )
