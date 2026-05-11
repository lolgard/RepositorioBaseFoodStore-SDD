# Change: delivery-addresses

## What
CRUD completo de direcciones de entrega para clientes. Cada cliente puede tener hasta 5 direcciones, con una marcada como predeterminada. Solo el dueño puede administrar sus direcciones.

## Why
- **US-024**: Como cliente, quiero agregar una dirección de entrega para usarla en mis pedidos.
- **US-025**: Como cliente, quiero editar una dirección existente para mantener mis datos actualizados.
- **US-026**: Como cliente, quiero eliminar una dirección que ya no uso.
- **US-027**: Como cliente, quiero marcar una dirección como predeterminada para agilizar el checkout.
- **US-028**: Como cliente, quiero ver el listado de mis direcciones guardadas.

## Dependencies
- `auth-system`: Ya implementa autenticación y `get_current_user_id`.
