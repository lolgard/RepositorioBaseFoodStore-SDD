"""
Order service with Unit of Work pattern for atomic order creation.
"""
from decimal import Decimal
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.product import Product
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.delivery_address_repository import DeliveryAddressRepository
from app.schemas.order import OrderCreate


class OrderService:
    """Service for order operations with atomic creation."""

    def __init__(
        self,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        address_repo: DeliveryAddressRepository,
        session,
    ):
        self.order_repo = order_repo
        self.product_repo = product_repo
        self.address_repo = address_repo
        self.session = session

    async def create_order(self, user_id: int, data: OrderCreate) -> Order:
        """
        Create an order atomically using Unit of Work pattern.

        1. Validate address ownership
        2. Validate products exist and have sufficient stock
        3. Snapshot prices and address
        4. Create Order, OrderItems, and OrderStatusHistory
        5. Decrement stock
        6. Commit (all or nothing)
        """
        # --- 1. Validate address ---
        address = await self.address_repo.get_by_user_and_id(user_id, data.delivery_address_id)
        if not address:
            raise NotFoundError("Delivery address not found")

        # --- 2. Validate products and stock ---
        products: dict[int, Product] = {}
        for item in data.items:
            product = await self.product_repo.get_by_id(item.product_id)
            if not product:
                raise NotFoundError("Product", item.product_id)
            if not product.available:
                raise BadRequestError(f"Product '{product.name}' is not available")
            if product.stock < item.quantity:
                raise BadRequestError(
                    f"Insufficient stock for '{product.name}': requested {item.quantity}, available {product.stock}"
                )
            products[item.product_id] = product

        # --- 3. Calculate totals ---
        subtotal = Decimal("0.00")
        order_items_data = []
        for item in data.items:
            product = products[item.product_id]
            price = Decimal(str(product.price))
            item_subtotal = price * Decimal(str(item.quantity))
            subtotal += item_subtotal
            order_items_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "product_price": price,
                "quantity": item.quantity,
                "subtotal": item_subtotal,
                "excluded_ingredients": item.excluded_ingredients or None,
                "notes": item.notes,
            })

        delivery_cost = Decimal("0.00")
        total = subtotal + delivery_cost

        # --- 4. Build address snapshot ---
        address_snapshot = {
            "street": address.street,
            "street_number": address.street_number,
            "city": address.city,
            "state": address.state,
            "zip_code": address.zip_code,
            "country": address.country,
            "additional_info": address.additional_info,
        }

        # --- 5. Create Order (within transaction) ---
        order = Order(
            user_id=user_id,
            status="PENDING",
            delivery_address_id=address.id,
            address_snapshot=address_snapshot,
            subtotal=subtotal,
            delivery_cost=delivery_cost,
            total=total,
            notes=data.notes,
        )
        created_order = await self.order_repo.create(order)

        # --- 6. Create OrderItems ---
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=created_order.id,
                **item_data,
            )
            await self.order_repo.create_order_item(order_item)

        # --- 7. Decrement stock ---
        for item in data.items:
            product = products[item.product_id]
            product.stock -= item.quantity
            await self.product_repo.update(product.id, {"stock": product.stock})

        # --- 8. Create status history ---
        history_entry = OrderStatusHistory(
            order_id=created_order.id,
            from_status=None,
            to_status="PENDING",
            changed_by=user_id,
        )
        await self.order_repo.create_status_history(history_entry)

        # --- 9. Final refresh ---
        await self.session.refresh(created_order)
        return created_order

    async def list_orders(self, user_id: int, role: str) -> list[Order]:
        """List orders. Staff sees all, clients see their own."""
        if role in ("STAFF", "GESTOR", "ADMIN"):
            return await self.order_repo.get_all()
        return await self.order_repo.get_by_user(user_id)

    async def get_order(self, order_id: int, user_id: int, role: str) -> Order:
        """Get order detail with items and history."""
        is_staff = role in ("STAFF", "GESTOR", "ADMIN")
        order = await self.order_repo.get_by_id_with_ownership(order_id, user_id, is_staff)
        if not order:
            raise NotFoundError("Order", order_id)
        return order
