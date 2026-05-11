# Spec: Order State Machine API

## PUT /api/v1/orders/{order_id}/status

Transiciona una orden a un nuevo estado válido según la FSM.

### Request
```json
{
  "status": "CONFIRMED",
  "reason": "Pago confirmado vía MercadoPago"
}
```

### Responses
- `200`: Estado cambiado exitosamente. Retorna OrderResponse completo.
- `400`: Transición inválida (BadRequestError con detalle)
- `403`: Rol no autorizado para esta transición
- `404`: Orden no encontrada
- `401`: Sin autenticación

### FSM
| Desde | Hacia | Roles |
|-------|-------|-------|
| PENDING | CONFIRMED | GESTOR, ADMIN |
| PENDING | CANCELLED | CLIENTE (owner), GESTOR, ADMIN |
| CONFIRMED | PREPARING | GESTOR, ADMIN |
| CONFIRMED | CANCELLED | GESTOR, ADMIN |
| PREPARING | READY | GESTOR, ADMIN |
| PREPARING | CANCELLED | GESTOR, ADMIN |
| READY | DELIVERED | GESTOR, ADMIN |
| READY | CANCELLED | GESTOR, ADMIN |

### Stock restore
Siempre que una orden pasa a CANCELLED, se restaura el stock de todos sus productos (sumando las cantidades de vuelta al stock actual).
