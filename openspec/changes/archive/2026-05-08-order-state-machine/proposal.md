# Propuesta: order-state-machine

## Qué
Implementar la máquina de estados finitos (FSM) para órdenes con 6 estados, transiciones validadas por rol, y restauración automática de stock al cancelar.

## Por qué
Hoy las órdenes se crean en PENDING pero no hay forma de cambiar su estado. Sin la FSM el flujo operativo está truncado: no se puede confirmar, preparar, entregar ni cancelar una orden.

## Dependencias
- order-creation (modelos Order, OrderItem, OrderStatusHistory)
- mercadopago-integration (webhook CONFIRMADO)

## Historias
US-039, US-040, US-041, US-042, US-043, US-044
