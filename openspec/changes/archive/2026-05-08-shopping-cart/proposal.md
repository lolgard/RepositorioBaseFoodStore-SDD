# Change: shopping-cart

## What
Carrito de compras completamente client-side usando Zustand con persistencia en localStorage. Permite agregar/quitar productos, personalizar (excluir ingredientes), modificar cantidades, y ver resumen con subtotal.

## Why
- **US-029**: Como cliente, quiero agregar productos al carrito para comprarlos después.
- **US-030**: Como cliente, quiero ver el resumen de mi carrito con productos, cantidades y subtotal.
- **US-031**: Como cliente, quiero modificar la cantidad de un producto en el carrito.
- **US-032**: Como cliente, quiero eliminar un producto del carrito.
- **US-033**: Como cliente, quiero excluir ingredientes de un producto en el carrito.
- **US-034**: Como cliente, quiero que mi carrito persista aunque cierre el navegador.

## Dependencies
- `product-catalog`: Los productos ya existen con sus ingredientes asociados.
