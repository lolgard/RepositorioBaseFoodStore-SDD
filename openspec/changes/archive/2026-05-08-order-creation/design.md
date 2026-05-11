# Design: order-creation

## Modelos

### Order (app/models/order.py)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int (PK) | |
| user_id | int (FK → users.id) | Dueño del pedido |
| status | str | `PENDING` (default). Enum: PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED |
| delivery_address_id | int (FK → delivery_address.id) | Dirección usada (snapshot implícito por FK) |
| address_snapshot | JSON/json | Snapshot completo de la dirección al crear el pedido |
| subtotal | Numeric(10,2) | Suma de items antes de costo de envío |
| delivery_cost | Numeric(10,2) | Costo de envío (0 por ahora) |
| total | Numeric(10,2) | subtotal + delivery_cost |
| notes | str \| null | Notas del cliente |
| created_at | datetime | utcnow |
| updated_at | datetime | |
| deleted_at | datetime \| null | |

### OrderItem (app/models/order_item.py)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int (PK) | |
| order_id | int (FK → orders.id) | |
| product_id | int (FK → products.id) | |
| product_name | str | Snapshot del nombre al crear |
| product_price | Numeric(10,2) | Snapshot del precio al crear |
| quantity | int | |
| subtotal | Numeric(10,2) | price * quantity |
| excluded_ingredients | JSON \| null | Lista de IDs de ingredientes excluidos |
| notes | str \| null | Notas del item |

### OrderStatusHistory (app/models/order_status_history.py)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int (PK) | |
| order_id | int (FK → orders.id) | |
| from_status | str \| null | null para la transición inicial |
| to_status | str | |
| changed_by | int (FK → users.id) | Quién cambió el estado |
| reason | str \| null | |
| created_at | datetime | utcnow (append-only) |

## Unit of Work (create_order)

La creación del pedido es una operación atómica:

1. **Validar carrito**: cada item debe tener producto_id, quantity > 0
2. **Validar dirección**: debe pertenecer al usuario
3. **Validar stock**: cada producto debe tener stock >= quantity solicitada
4. **Snapshot de precios**: leer precio actual de cada producto
5. **Snapshot de dirección**: leer dirección actual y guardar como JSON
6. **Crear Order**: con status PENDING, subtotal, delivery_cost, total
7. **Crear OrderItems**: uno por item del carrito
8. **Decrementar stock**: product.stock -= quantity
9. **Crear OrderStatusHistory**: from=null, to=PENDING
10. **Commit** (si algo falla, rollback todo)

## Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| POST | /api/v1/orders | Crear pedido desde carrito |
| GET | /api/v1/orders | Listar pedidos del usuario |
| GET | /api/v1/orders/{id} | Detalle del pedido con items e historial |

### POST /api/v1/orders
Request body:
```json
{
  "delivery_address_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "excluded_ingredients": [3, 5],
      "notes": "Sin cebolla"
    }
  ],
  "notes": "Llamar antes de entregar"
}
```

Response: OrderResponse con items.

## Frontend

No se toca frontend en este change. El botón "Proceed to Checkout" se habilita cuando esté listo el flujo completo (order-creation + mercadopago-integration).

## Tests
- Crear pedido exitosamente (con items, dirección, stock, snapshots)
- Crear pedido con stock insuficiente (error 400)
- Crear pedido con dirección de otro usuario (error 404)
- Crear pedido sin autenticación (error 401)
- Crear pedido con carrito vacío (error 400)
- Listar pedidos del usuario
- Obtener detalle del pedido
- Verificar snapshots de precio y dirección
- Verificar decremento de stock
- Verificar creación de historial de estado
