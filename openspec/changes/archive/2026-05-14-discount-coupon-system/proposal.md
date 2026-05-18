# Proposal: Discount Coupon System

## Why
Implementar cupones de descuento incentiva la compra, fideliza a los clientes y permite campañas de marketing efectivas.

## What Changes
- Crear modelo `DiscountCoupon` (código, tipo, valor, límite, fecha, activo).
- Crear endpoints para validar y aplicar cupones en el checkout.
- Integrar la lógica en el proceso de creación de pedidos (Change 11).

## Impact
- Backend: Modelo, repositorio, service y router de cupones.
- Frontend: Campo de texto para ingresar cupones en el checkout y feedback de validación.
- Lógica de negocio: Ajuste en el cálculo de precio final del pedido.
