"""
Order State Machine service with FSM validation and stock management.
"""
from decimal import Decimal
from app.core.exceptions import BadRequestError, NotFoundError, ForbiddenError
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.product import Product
from app.models.user import UserRole
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import BaseRepository
from app.core.websocket import manager
from sqlmodel import select


# FSM Definition: [from_status][to_status] = list of allowed roles
# CLIENTE is NOT in the list — handled specially via ownership check
VALID_TRANSITIONS: dict[str, dict[str, list[UserRole]]] = {
    "PENDING": {
        "CONFIRMED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
        "CANCELLED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],  # CLIENTE handled separately
    },
    "CONFIRMED": {
        "PREPARING": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
        "CANCELLED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
    },
    "PREPARING": {
        "READY": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
        "CANCELLED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
    },
    "READY": {
        "DELIVERED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
        "CANCELLED": [UserRole.STAFF, UserRole.GESTOR, UserRole.ADMIN],
    },
    "DELIVERED": {},   # terminal
    "CANCELLED": {},   # terminal
}

# States where cancelling restores stock
STOCK_RESTORE_STATES = {"PENDING", "CONFIRMED", "PREPARING", "READY"}

# Terminal states
TERMINAL_STATES = {"DELIVERED", "CANCELLED"}


class OrderStateMachineService:
    """Validates and executes order status transitions."""

    def __init__(self, session, order_repo: OrderRepository, product_repo: BaseRepository):
        self.session = session
        self.order_repo = order_repo
        self.product_repo = product_repo

    async def transition(self, order_id: int, user_id: int, role: str, to_status: str, reason: str | None = None) -> Order:
        """
        Transition an order to a new status.

        1. Load order (with ownership check for CLIENTE)
        2. Validate transition is allowed
        3. Validate role is allowed (or CLIENTE own cancel)
        4. Restore stock if cancelling
        5. Update order status
        6. Create StatusHistory entry
        7. Return updated order
        """
        # --- 1. Load order ---
        is_staff = role in (UserRole.STAFF.value, UserRole.GESTOR.value, UserRole.ADMIN.value)
        order = await self.order_repo.get_by_id_with_ownership(order_id, user_id, is_staff)
        if not order:
            raise NotFoundError("Order", order_id)

        from_status = order.status

        # --- 2. Terminal check ---
        if from_status in TERMINAL_STATES:
            raise BadRequestError(f"Order is already in terminal state '{from_status}'")

        # --- 3. Validate transition ---
        if from_status not in VALID_TRANSITIONS:
            raise BadRequestError(f"Unknown status '{from_status}'")

        allowed_roles = VALID_TRANSITIONS[from_status].get(to_status, [])
        if not allowed_roles and to_status != "CANCELLED":
            raise BadRequestError(f"Cannot transition from '{from_status}' to '{to_status}'")

        # --- 4. Validate role ---
        user_role_enum = UserRole(role) if role in [r.value for r in UserRole] else None
        is_allowed_role = user_role_enum in allowed_roles

        # Special case: CLIENTE can cancel their own PENDING order
        can_cliente_cancel = (
            role == UserRole.CLIENTE.value
            and to_status == "CANCELLED"
            and from_status == "PENDING"
            and not is_staff  # sanity: they're not staff
        )

        if not is_allowed_role and not can_cliente_cancel:
            if to_status == "CANCELLED":
                raise ForbiddenError("You are not allowed to cancel this order")
            raise ForbiddenError(f"You are not allowed to change status from '{from_status}' to '{to_status}'")

        # --- 5. Restore stock if cancelling ---
        if to_status == "CANCELLED" and from_status in STOCK_RESTORE_STATES:
            await self._restore_stock(order_id)

        # --- 6. Update order ---
        order.status = to_status
        self.session.add(order)
        await self.session.flush()

        # --- 7. Create history entry ---
        history = OrderStatusHistory(
            order_id=order.id,
            from_status=from_status,
            to_status=to_status,
            changed_by=user_id,
            reason=reason,
        )
        await self.order_repo.create_status_history(history)

        await self.session.refresh(order)
        
        # Notify user via WebSocket
        message = {
            "type": "ORDER_STATUS_CHANGED",
            "order_id": order.id,
            "status": order.status,
            "message": f"Tu pedido #{order.id} ha cambiado a {order.status}"
        }
        await manager.send_personal_message(message, order.user_id)

        return order

    async def _restore_stock(self, order_id: int) -> None:
        """Restore product stock when an order is cancelled."""
        items = await self.order_repo.get_items_by_order(order_id)
        for item in items:
            result = await self.session.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = result.scalar_one_or_none()
            if product:
                product.stock += item.quantity
                self.session.add(product)
