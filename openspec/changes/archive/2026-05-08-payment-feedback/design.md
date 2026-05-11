# Design: payment-feedback

## OrderConfirmationPage
- Ruta: `/orders/{id}/confirmed`
- Muestra: ID del pedido, total, estado "PENDING"
- Botón "Pay with MercadoPago" → redirige a `init_point`
- Link a detalle del pedido

## PaymentFeedbackPage
- Ruta: `/payment/feedback`
- Lee query params: `status` (success/failure/pending), `payment_id`, `external_reference`
- Muestra feedback visual según status:
  - success: ✅ check verde + mensaje
  - failure: ❌ rojo + mensaje
  - pending: ⏳ amarillo + "estamos procesando"
- Botón "View Order" → lleva a detalle

## Flujo
1. Usuario crea orden → va a OrderConfirmationPage
2. Click "Pay" → MercadoPago checkout
3. MP redirige a `/payment/feedback?status=success&...`
4. Usuario ve feedback
