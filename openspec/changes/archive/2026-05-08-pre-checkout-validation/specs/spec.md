# Specification: Pre-checkout Validation

## API

### POST /api/v1/checkout/validate
- Auth: Bearer token
- Body: `{ items: [{ product_id: int, quantity: int, expected_price?: str }] }`
- Response: 200 `{ valid: bool, issues: CheckoutIssue[] }`
- No modifica datos (solo lectura)

### CheckoutIssue
| Campo | Tipo | Descripción |
|-------|------|-------------|
| type | str | `stock_changed`, `price_changed`, `product_unavailable`, `product_not_found` |
| product_id | int | |
| product_name | str | |
| message | str | Descripción legible del problema |
| requested | int | Cantidad solicitada (stock) |
| available | int | Stock disponible (stock) |
| expected_price | str | Precio esperado (price_changed) |
| current_price | str | Precio actual (price_changed) |

### Flujo
1. Frontend tiene items en el carrito (Zustand store)
2. Usuario hace clic en "Proceed to Checkout"
3. Frontend llama a `POST /api/v1/checkout/validate` con los items
4. Si `valid: true` → procede a crear el pedido
5. Si `valid: false` → muestra los issues al usuario y no procede

Este endpoint NO bloquea cambios de precio/stock, solo informa. El usuario decide si proceder o no.

Sin embargo, POST /orders (change 11) SÍ bloquea: si el stock cambió entre la validación y la creación, rechaza el pedido.
