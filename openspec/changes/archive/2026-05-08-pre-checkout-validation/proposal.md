# Change: pre-checkout-validation

## What
Endpoint de validación que el frontend llama antes de proceder al checkout. Verifica que todos los productos del carrito sigan teniendo stock suficiente y detecta cambios de precio desde que se agregaron al carrito.

## Why
- **US-069**: Como cliente, quiero que se valide el stock antes de crear el pedido para evitar sorpresas.
- **US-070**: Como cliente, quiero que se me notifique si algún precio cambió antes de confirmar el pedido.

## Dependencies
- `shopping-cart`: El frontend envía los items del carrito a validar.
- `order-creation`: La validación replica la misma lógica de stock que usa create_order.
