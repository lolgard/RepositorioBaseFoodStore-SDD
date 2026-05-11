# Specification: Order Creation

## Data Model

### Order statuses
```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED
  ↓          ↓
CANCELLED  CANCELLED
```

### Order (table: orders)
- `id`: Integer, PK, autoincrement
- `user_id`: Integer, FK → users.id, NOT NULL, indexed
- `status`: String(20), NOT NULL, default 'PENDING'
- `delivery_address_id`: Integer, FK → delivery_address.id, NOT NULL
- `address_snapshot`: JSON (Text), NOT NULL — snapshot completo de la dirección
- `subtotal`: Numeric(10,2), NOT NULL
- `delivery_cost`: Numeric(10,2), NOT NULL, default 0
- `total`: Numeric(10,2), NOT NULL
- `notes`: Text, nullable
- `created_at`: DateTime, NOT NULL, default utcnow
- `updated_at`: DateTime, NOT NULL, default utcnow, onupdate utcnow
- `deleted_at`: DateTime, nullable

### OrderItem (table: order_items)
- `id`: Integer, PK, autoincrement
- `order_id`: Integer, FK → orders.id, NOT NULL, indexed
- `product_id`: Integer, FK → products.id, NOT NULL
- `product_name`: String(200), NOT NULL (snapshot)
- `product_price`: Numeric(10,2), NOT NULL (snapshot)
- `quantity`: Integer, NOT NULL, > 0
- `subtotal`: Numeric(10,2), NOT NULL
- `excluded_ingredients`: JSON (Text), nullable
- `notes`: Text, nullable

### OrderStatusHistory (table: order_status_history)
- `id`: Integer, PK, autoincrement
- `order_id`: Integer, FK → orders.id, NOT NULL, indexed
- `from_status`: String(20), nullable (null para el estado inicial)
- `to_status`: String(20), NOT NULL
- `changed_by`: Integer, FK → users.id, NOT NULL
- `reason`: Text, nullable
- `created_at`: DateTime, NOT NULL, default utcnow

## API

### POST /api/v1/orders
- Auth: Bearer token (cualquier role)
- Body: `{ delivery_address_id: int, items: [{ product_id, quantity, excluded_ingredients?, notes? }], notes? }`
- Validaciones:
  - items no vacío
  - cada item: product_id existente, quantity > 0
  - delivery_address_id pertenece al usuario
  - stock suficiente para cada producto
- Proceso atómico (Unit of Work):
  1. Validar items y dirección
  2. Calcular subtotal con precios actuales (snapshot)
  3. Crear Order con address_snapshot = JSON de la dirección
  4. Crear OrderItems con snapshots de nombre y precio
  5. Decrementar stock de cada producto
  6. Crear OrderStatusHistory (→ PENDING)
  7. Commit
- Response: 201, OrderResponse con items e historial
- Errors: 400 (stock, carrito vacío), 404 (producto/dirección), 401

### GET /api/v1/orders
- Auth: Bearer token
- Cliente: solo sus pedidos. Staff/Gestor/Admin: todos.
- Response: 200, list[OrderResponse]

### GET /api/v1/orders/{id}
- Auth: Bearer token
- Ownership check (cliente solo su pedido)
- Response: 200, OrderResponse con items e historial
- Errors: 404, 401

### OrderResponse
```json
{
  "id": 1,
  "user_id": 1,
  "status": "PENDING",
  "delivery_address_id": 1,
  "address_snapshot": { ... },
  "subtotal": "100.00",
  "delivery_cost": "0.00",
  "total": "100.00",
  "notes": null,
  "created_at": "...",
  "updated_at": "...",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Hamburguesa Clásica",
      "product_price": "50.00",
      "quantity": 2,
      "subtotal": "100.00",
      "excluded_ingredients": [3, 5],
      "notes": "Sin cebolla"
    }
  ],
  "status_history": [
    {
      "from_status": null,
      "to_status": "PENDING",
      "changed_by": 1,
      "created_at": "..."
    }
  ]
}
```

## Stock Validation
- Al crear el pedido, verificar `product.stock >= sum(item.quantity)` para cada producto.
- Si no hay stock suficiente → 400 con detalle de qué producto no tiene stock.
- Si pasa, decrementar: `product.stock -= quantity`.

## Price Snapshot
- Al crear el pedido, leer el precio actual de `product.price` y guardarlo en `order_item.product_price`.
- El subtotal del item se calcula como `price * quantity`.
- El subtotal de la orden es la suma de todos los items.

## Address Snapshot
- Al crear el pedido, leer la dirección actual desde `delivery_address` y guardar sus campos como JSON.
- Esto protege contra cambios futuros en la dirección.
