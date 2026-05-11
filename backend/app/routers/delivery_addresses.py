"""
Delivery addresses router.
"""
from fastapi import APIRouter, Depends

from app.core.database import get_session
from app.routers.dependencies import get_current_user_id
from app.repositories.delivery_address_repository import DeliveryAddressRepository
from app.services.delivery_address_service import DeliveryAddressService
from app.schemas.delivery_address import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(prefix="/api/v1/addresses", tags=["addresses"])


def _get_service(session=Depends(get_session)) -> DeliveryAddressService:
    return DeliveryAddressService(DeliveryAddressRepository(session))


@router.get("/")
async def list_addresses(
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """List all addresses for the authenticated user."""
    addresses = await service.list_addresses(user_id)
    return [AddressResponse.model_validate(a) for a in addresses]


@router.post("/", status_code=201)
async def create_address(
    data: AddressCreate,
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """Create a new delivery address."""
    address = await service.create_address(user_id, data)
    return AddressResponse.model_validate(address)


@router.get("/{address_id}")
async def get_address(
    address_id: int,
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """Get a specific address."""
    address = await service.get_address(user_id, address_id)
    return AddressResponse.model_validate(address)


@router.put("/{address_id}")
async def update_address(
    address_id: int,
    data: AddressUpdate,
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """Update a delivery address."""
    address = await service.update_address(user_id, address_id, data)
    return AddressResponse.model_validate(address)


@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """Delete a delivery address."""
    await service.delete_address(user_id, address_id)
    return {"message": "Address deleted successfully"}


@router.put("/{address_id}/default")
async def set_default_address(
    address_id: int,
    user_id: int = Depends(get_current_user_id),
    service: DeliveryAddressService = Depends(_get_service),
):
    """Set an address as the default."""
    address = await service.set_default(user_id, address_id)
    return AddressResponse.model_validate(address)
