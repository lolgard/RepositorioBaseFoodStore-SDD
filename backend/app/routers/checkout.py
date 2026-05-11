"""
Pre-checkout validation router.
"""
from fastapi import APIRouter, Depends

from app.core.database import get_session
from app.routers.dependencies import get_current_user_id
from app.repositories.product_repository import ProductRepository
from app.services.checkout_validation_service import CheckoutValidationService
from app.schemas.checkout import CheckoutValidationRequest, CheckoutValidationResponse

router = APIRouter(prefix="/api/v1/checkout", tags=["checkout"])


def _get_service(session=Depends(get_session)) -> CheckoutValidationService:
    return CheckoutValidationService(ProductRepository(session))


@router.post("/validate")
async def validate_checkout(
    data: CheckoutValidationRequest,
    user_id: int = Depends(get_current_user_id),
    service: CheckoutValidationService = Depends(_get_service),
):
    """Validate cart items before proceeding to checkout."""
    is_valid, issues = await service.validate(data.items)
    return CheckoutValidationResponse(valid=is_valid, issues=issues)
