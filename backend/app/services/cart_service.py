from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cart import Cart, CartItem
from app.repositories.cart_repository import CartRepository
from app.repositories.cart_item_repository import CartItemRepository
from app.schemas.cart import CartItemCreate

class CartService:
    def __init__(self, session: AsyncSession):
        self.cart_repo = CartRepository(session)
        self.item_repo = CartItemRepository(session)

    async def get_cart(self, user_id: int) -> Cart:
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            await self.cart_repo.create(cart)
        return cart

    async def sync_cart(self, user_id: int, items_in: List[CartItemCreate]) -> Cart:
        cart = await self.get_cart(user_id)
        
        # Clear existing items
        await self.item_repo.delete_by_cart_id(cart.id)
        
        # Add new items
        for item_in in items_in:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item_in.product_id,
                name=item_in.name,
                price=item_in.price,
                quantity=item_in.quantity,
                excluded_ingredients=",".join(map(str, item_in.excluded_ingredients)),
                notes=item_in.notes
            )
            await self.item_repo.create(new_item)
            
        await self.cart_repo.session.refresh(cart)
        return cart

    async def delete_cart(self, user_id: int):
        cart = await self.get_cart(user_id)
        await self.item_repo.delete_by_cart_id(cart.id)
        await self.cart_repo.hard_delete(cart.id)
