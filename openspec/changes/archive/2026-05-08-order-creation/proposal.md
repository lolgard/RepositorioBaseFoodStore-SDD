# Change: order-creation

## What
Sistema completo de creación de pedidos: modelo de datos (Order, OrderItem, OrderStatusHistory), creación atómica con Unit of Work, snapshots de precio y dirección, validación y decremento de stock, y auditoría append-only de cambios de estado.

## Why
- **US-035**: Como cliente, quiero crear un pedido con los productos de mi carrito y mi dirección de entrega.
- **US-036**: Como cliente, quiero que el precio de los productos se congele al momento de crear el pedido.
- **US-037**: Como cliente, quiero que la dirección de entrega se congele al momento de crear el pedido.
- **US-038**: Como gestor, quiero que el stock se descuente automáticamente al crear un pedido.

## Dependencies
- `product-catalog`: Productos con stock y precio.
- `delivery-addresses`: Direcciones de entrega del usuario.
- `shopping-cart`: Items del carrito (se envían desde el frontend al crear el pedido).
