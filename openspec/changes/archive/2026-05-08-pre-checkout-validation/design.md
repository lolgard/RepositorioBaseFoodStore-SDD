# Design: pre-checkout-validation

## Endpoint

### POST /api/v1/checkout/validate

Recibe los mismos items que recibiría POST /orders, pero NO crea el pedido. Solo valida.

**Request body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

**Response 200 — todo OK:**
```json
{
  "valid": true,
  "issues": []
}
```

**Response 200 — con issues:**
```json
{
  "valid": false,
  "issues": [
    {
      "type": "stock_changed",
      "product_id": 1,
      "product_name": "Hamburguesa Clásica",
      "requested": 5,
      "available": 2,
      "message": "Insufficient stock for 'Hamburguesa Clásica': requested 5, available 2"
    },
    {
      "type": "price_changed",
      "product_id": 2,
      "product_name": "Papas Fritas",
      "expected_price": "10.00",
      "current_price": "12.00",
      "message": "Price changed for 'Papas Fritas': was $10.00, now $12.00"
    }
  ]
}
```

**Response 401 — no autenticado**

### Validaciones
1. Cada `product_id` existe y está disponible
2. `product.stock >= item.quantity`
3. Si el frontend envía `expected_price`, se compara con `product.price`

## Frontend
No se toca frontend en este change. El botón "Proceed to Checkout" se conectará a este endpoint cuando se implemente el flujo completo de checkout.

## Tests
- Validación exitosa (sin issues)
- Stock insuficiente detectado
- Producto no disponible detectado
- Producto inexistente detectado
- Cambio de precio detectado
- Sin autenticación (401)
