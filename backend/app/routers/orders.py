"""
Orders router: create, list, detail.
"""
from fastapi import APIRouter, Depends

from app.core.database import get_session
from app.routers.dependencies import get_current_user_id, get_current_user_role
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.delivery_address_repository import DeliveryAddressRepository
from app.services.order_service import OrderService
from app.services.order_state_machine import OrderStateMachineService
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusHistoryResponse, StatusChangeRequest, StatusChangeResponse
from app.repositories.base_repository import BaseRepository
from app.models.product import Product

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


async def _get_service(session=Depends(get_session)) -> OrderService:
    return OrderService(
        order_repo=OrderRepository(session),
        product_repo=ProductRepository(session),
        address_repo=DeliveryAddressRepository(session),
        session=session,
    )


@router.post("/", status_code=201)
async def create_order(
    data: OrderCreate,
    user_id: int = Depends(get_current_user_id),
    service: OrderService = Depends(_get_service),
):
    """Create a new order from cart items."""
    order = await service.create_order(user_id, data)
    return await _build_order_response(order, service)


@router.get("/")
async def list_orders(
    user_id: int = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role),
    service: OrderService = Depends(_get_service),
):
    """List orders. Staff sees all, clients see their own."""
    orders = await service.list_orders(user_id, role)
    result = []
    for order in orders:
        items = await service.order_repo.get_items_by_order(order.id)
        history = await service.order_repo.get_history_by_order(order.id)
        result.append(_order_to_dict(order, items, history))
    return result


@router.get("/{order_id}")
async def get_order(
    order_id: int,
    user_id: int = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role),
    service: OrderService = Depends(_get_service),
):
    """Get order detail with items and status history."""
    order = await service.get_order(order_id, user_id, role)
    return await _build_order_response(order, service)


async def _build_order_response(order, service):
    """Build full OrderResponse with items and history."""
    items = await service.order_repo.get_items_by_order(order.id)
    history = await service.order_repo.get_history_by_order(order.id)
    return _order_to_dict(order, items, history)


def _order_to_dict(order, items, history):
    """Convert order to dict matching OrderResponse shape."""
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        delivery_address_id=order.delivery_address_id,
        address_snapshot=order.address_snapshot,
        subtotal=str(order.subtotal),
        delivery_cost=str(order.delivery_cost),
        total=str(order.total),
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[OrderItemResponse(
            id=i.id, order_id=i.order_id, product_id=i.product_id,
            product_name=i.product_name, product_price=str(i.product_price),
            quantity=i.quantity, subtotal=str(i.subtotal),
            excluded_ingredients=i.excluded_ingredients, notes=i.notes,
        ) for i in items],
        status_history=[OrderStatusHistoryResponse(
            id=h.id, order_id=h.order_id, from_status=h.from_status,
            to_status=h.to_status, changed_by=h.changed_by,
            reason=h.reason, created_at=h.created_at,
        ) for h in history],
    )


@router.put("/{order_id}/status")
async def change_order_status(
    order_id: int,
    data: StatusChangeRequest,
    user_id: int = Depends(get_current_user_id),
    role: str = Depends(get_current_user_role),
    session=Depends(get_session),
):
    """Change order status following the FSM."""
    service = OrderStateMachineService(
        session=session,
        order_repo=OrderRepository(session),
        product_repo=BaseRepository(Product, session),
    )
    order = await service.transition(order_id, user_id, role, data.status, data.reason)

    # Build full response
    items = await service.order_repo.get_items_by_order(order.id)
    history = await service.order_repo.get_history_by_order(order.id)
    return _order_to_dict(order, items, history)
