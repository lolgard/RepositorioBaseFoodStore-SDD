"""MercadoPago integration service."""
import hashlib
import hmac
from decimal import Decimal
from typing import Optional
import httpx

from app.core.config import settings
from app.core.exceptions import BadRequestError, NotFoundError
from app.models.payment import Payment
from app.repositories.base_repository import BaseRepository


class MercadoPagoService:
    """Service for MercadoPago payment processing."""

    API_BASE = "https://api.mercadopago.com"

    def __init__(self, payment_repo: BaseRepository[Payment], order_repo, product_repo, address_repo, session):
        self.payment_repo = payment_repo
        self.order_repo = order_repo
        self.product_repo = product_repo
        self.address_repo = address_repo
        self.session = session

    async def create_preference(self, user_id: int, order_id: int) -> tuple[str, str]:
        """Create a MercadoPago payment preference for an order."""
        from app.services.order_service import OrderService
        from app.schemas.order import OrderCreate, OrderItemInput

        # Get order
        order_svc = OrderService(self.order_repo, self.product_repo, self.address_repo, self.session)
        # Since get_order needs role, we'll check ownership differently
        order = await self.order_repo.get_by_id(order_id)
        if not order or order.user_id != user_id:
            raise NotFoundError("Order", order_id)
        if order.status != "PENDING":
            raise BadRequestError("Order is not in PENDING status")

        # Build preference payload
        items = await self.order_repo.get_items_by_order(order_id)
        mp_items = []
        for item in items:
            mp_items.append({
                "title": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.product_price),
                "currency_id": "ARS",
            })

        preference_data = {
            "items": mp_items,
            "external_reference": str(order_id),
            "back_urls": {
                "success": f"{settings.APP_URL}/orders/{order_id}",
                "failure": f"{settings.APP_URL}/orders/{order_id}",
                "pending": f"{settings.APP_URL}/orders/{order_id}",
            },
            "auto_return": "approved",
            "notification_url": f"{settings.API_URL}/api/v1/payments/webhook",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.API_BASE}/checkout/preferences",
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json",
                },
                json=preference_data,
            )
            if response.status_code not in (200, 201):
                raise BadRequestError(f"MercadoPago error: {response.text}")

            result = response.json()
            preference_id = result["id"]
            init_point = result["init_point"]

        # Save payment record
        payment = Payment(
            order_id=order_id,
            mp_preference_id=preference_id,
            status="pending",
            transaction_amount=Decimal(str(order.total)),
        )
        await self.payment_repo.create(payment)

        return preference_id, init_point

    async def process_webhook(self, data: dict) -> None:
        """Process MercadoPago IPN webhook."""
        topic = data.get("type", "")
        if topic == "payment":
            payment_id = data.get("data", {}).get("id")
            if payment_id:
                await self._update_payment_status(str(payment_id))

    async def _update_payment_status(self, mp_payment_id: str) -> None:
        """Query MercadoPago API and update payment status."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_BASE}/v1/payments/{mp_payment_id}",
                headers={"Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}"},
            )
            if response.status_code != 200:
                return

            result = response.json()
            external_ref = result.get("external_reference", "")
            status = result.get("status", "")
            status_detail = result.get("status_detail", "")
            payer_email = result.get("payer", {}).get("email")

            if not external_ref:
                return

            order_id = int(external_ref)

            # Find payment by order_id
            from sqlmodel import select
            result_payment = await self.session.execute(
                select(Payment).where(Payment.order_id == order_id).order_by(Payment.created_at.desc())
            )
            payment = result_payment.scalar_one_or_none()
            if payment:
                payment.mp_payment_id = mp_payment_id
                payment.status = status
                payment.status_detail = status_detail
                payment.payer_email = payer_email
                await self.session.flush()
                await self.session.refresh(payment)

    async def get_payment_status(self, order_id: int, user_id: int) -> Optional[Payment]:
        """Get payment status for an order."""
        from sqlmodel import select
        result = await self.session.execute(
            select(Payment).where(Payment.order_id == order_id).order_by(Payment.created_at.desc())
        )
        return result.scalar_one_or_none()
