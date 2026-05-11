# Design: mercadopago-integration

## Modelos
### Payment (app/models/payment.py)
- id, order_id (FK), mp_preference_id, mp_payment_id, status, status_detail, transaction_amount, payer_email, created_at, updated_at

## Endpoints
- `POST /api/v1/payments/create-preference` → crea preferencia MP para una orden
- `POST /api/v1/payments/webhook` → IPN de MercadoPago (sin auth, verifica firma)
- `GET /api/v1/payments/{order_id}/status` → consulta estado

## Servicio
- Usa `requests` o `httpx` para llamar a la API de MercadoPago
- Config: MERCADOPAGO_ACCESS_TOKEN en settings
- Idempotency key para evitar duplicados
