# Design: order-state-machine

## FSM: 6 estados

```
PENDING ──(GESTOR,ADMIN)──→ CONFIRMED
PENDING ──(CLIENTE,GESTOR,ADMIN)──→ CANCELLED

CONFIRMED ──(GESTOR,ADMIN)──→ PREPARING
CONFIRMED ──(GESTOR,ADMIN)──→ CANCELLED

PREPARING ──(GESTOR,ADMIN)──→ READY
PREPARING ──(GESTOR,ADMIN)──→ CANCELLED

READY ──(GESTOR,ADMIN)──→ DELIVERED
READY ──(GESTOR,ADMIN)──→ CANCELLED

DELIVERED → (terminal, no salida)
CANCELLED → (terminal, no salida)
```

## Reglas de stock
- Cancelar desde PENDING o CONFIRMED: restaurar stock (se decrementó al crear)
- Cancelar desde PREPARING o READY: restaurar stock
- DELIVERED y CANCELLED: terminales, no se puede volver atrás
- CONFIRMED (desde webhook MP): mismo efecto que GESTOR confirma

## Endpoint
- `PUT /api/v1/orders/{order_id}/status` → cambia estado
  - Body: `{ "status": "CONFIRMED", "reason": "..." }`
  - Respuesta: OrderResponse actualizado

## Servicio
- `OrderStateMachineService` con método `transition(order, new_status, user_id, role, reason)`
- Define `VALID_TRANSITIONS: dict[str, dict[str, list[UserRole]]]`
- Valida: estado actual → destino válido? usuario tiene rol?
- Si aplica: restaura stock (restar de products)
- Crea entrada en OrderStatusHistory
- Actualiza order.status

## Seguridad
- CLIENTE solo puede: PENDING → CANCELLED (su propia orden)
- GESTOR y ADMIN pueden: todas las transiciones de staff
- ADMIN bypass siempre (por `require_role`)
- Validar ownership en transiciones de CLIENTE
