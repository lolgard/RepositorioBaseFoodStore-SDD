"""
Delivery address service.
"""
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.delivery_address import DeliveryAddress
from app.repositories.delivery_address_repository import DeliveryAddressRepository
from app.schemas.delivery_address import AddressCreate, AddressUpdate

MAX_ADDRESSES = 5


class DeliveryAddressService:
    """Service for delivery address operations."""

    def __init__(self, repo: DeliveryAddressRepository):
        self.repo = repo

    async def create_address(self, user_id: int, data: AddressCreate) -> DeliveryAddress:
        """Create a new address. Max 5 per user."""
        count = await self.repo.count_by_user(user_id)
        if count >= MAX_ADDRESSES:
            raise BadRequestError(f"Maximum of {MAX_ADDRESSES} addresses allowed")

        # First address is always default
        is_default = count == 0 or data.is_default

        if is_default:
            await self.repo.unset_default_for_user(user_id)

        address = DeliveryAddress(
            user_id=user_id,
            street=data.street,
            street_number=data.street_number,
            city=data.city,
            state=data.state,
            zip_code=data.zip_code,
            country=data.country,
            is_default=is_default,
            additional_info=data.additional_info,
        )
        return await self.repo.create(address)

    async def list_addresses(self, user_id: int) -> list[DeliveryAddress]:
        """List all addresses for a user."""
        return await self.repo.get_by_user(user_id)

    async def get_address(self, user_id: int, address_id: int) -> DeliveryAddress:
        """Get a specific address with ownership check."""
        address = await self.repo.get_by_user_and_id(user_id, address_id)
        if not address:
            raise NotFoundError("Address not found")
        return address

    async def update_address(self, user_id: int, address_id: int, data: AddressUpdate) -> DeliveryAddress:
        """Update an address with ownership check."""
        await self.get_address(user_id, address_id)

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            address = await self.repo.get_by_user_and_id(user_id, address_id)
            return address

        if update_data.get("is_default"):
            await self.repo.unset_default_for_user(user_id)

        return await self.repo.update(address_id, update_data)

    async def delete_address(self, user_id: int, address_id: int) -> None:
        """Soft delete an address with ownership check."""
        address = await self.get_address(user_id, address_id)
        await self.repo.soft_delete(address.id)

    async def set_default(self, user_id: int, address_id: int) -> DeliveryAddress:
        """Set an address as default."""
        await self.get_address(user_id, address_id)
        await self.repo.unset_default_for_user(user_id)
        return await self.repo.update(address_id, {"is_default": True})
