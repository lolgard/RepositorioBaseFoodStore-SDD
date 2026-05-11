from fastapi import APIRouter, Depends, Request
from app.core.database import get_session
from app.routers.dependencies import get_current_user_id
from app.repositories.base_repository import BaseRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.delivery_address_repository import DeliveryAddressRepository
from app.models.payment import Payment
from app.services.mercadopago_service import MercadoPagoService
from app.schemas.payment import CreatePreferenceRequest, CreatePreferenceResponse, PaymentStatusResponse

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


def _get_service(session=Depends(get_session)) -> MercadoPagoService:
    return MercadoPagoService(
        payment_repo=BaseRepository(Payment, session),
        order_repo=OrderRepository(session),
        product_repo=ProductRepository(session),
        address_repo=DeliveryAddressRepository(session),
        session=session,
    )


@router.post("/create-preference")
async def create_preference(
    data: CreatePreferenceRequest,
    user_id: int = Depends(get_current_user_id),
    service: MercadoPagoService = Depends(_get_service),
):
    pref_id, init_point = await service.create_preference(user_id, data.order_id)
    return CreatePreferenceResponse(preference_id=pref_id, init_point=init_point, order_id=data.order_id)


@router.post("/webhook")
async def webhook(
    request: Request,
    service: MercadoPagoService = Depends(_get_service),
):
    data = await request.json()
    await service.process_webhook(data)
    return {"message": "OK"}


@router.get("/{order_id}/status")
async def get_payment_status(
    order_id: int,
    user_id: int = Depends(get_current_user_id),
    service: MercadoPagoService = Depends(_get_service),
):
    payment = await service.get_payment_status(order_id, user_id)
    if not payment:
        return {"order_id": order_id, "status": "not_found"}
    return PaymentStatusResponse(
        order_id=payment.order_id,
        payment_id=payment.mp_payment_id,
        status=payment.status,
        status_detail=payment.status_detail,
        transaction_amount=str(payment.transaction_amount),
        created_at=payment.created_at,
    )
