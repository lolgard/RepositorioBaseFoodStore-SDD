# Change: mercadopago-integration

## What
Integración con MercadoPago Orders API para procesar pagos. Creación de preferencias de pago, webhooks IPN (Instant Payment Notification), consulta de estado, y reintento de pago.

## Why
- **US-045**: Como cliente, quiero pagar con MercadoPago al crear mi pedido.
- **US-046**: Como cliente, quiero que el sistema registre el pago automáticamente cuando MercadoPago lo confirme.
- **US-047**: Como cliente, quiero reintentar el pago si falla.
- **US-048**: Como gestor, quiero ver el estado del pago de cada pedido.

## Dependencies
- `order-creation`: Los pedidos ya existen y tienen estado PENDING.
