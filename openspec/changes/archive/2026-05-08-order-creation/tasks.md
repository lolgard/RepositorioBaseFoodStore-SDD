# Tasks: order-creation

## Backend

- [ ] 1. Crear modelo Order con SQLModel
- [ ] 2. Crear modelo OrderItem con SQLModel
- [ ] 3. Crear modelo OrderStatusHistory con SQLModel
- [ ] 4. Agregar modelos a `models/__init__.py`
- [ ] 5. Crear schemas: OrderCreate, OrderItemInput, OrderResponse, OrderItemResponse, OrderStatusHistoryResponse
- [ ] 6. Crear repositorio OrderRepository
- [ ] 7. Crear servicio OrderService con Unit of Work (create_order atómico)
- [ ] 8. Crear router con POST /orders, GET /orders, GET /orders/{id}
- [ ] 9. Registrar router en main.py y routers/__init__.py
- [ ] 10. Crear migración Alembic para las 3 tablas
- [ ] 11. Escribir tests (mínimo 10)
- [ ] 12. Verificar que tests existentes no se rompen

## Frontend

- [ ] 13. No aplica (se habilita checkout cuando esté el flujo completo)

## Verification

- [ ] 14. Verificar: Tests pasan
- [ ] 15. Verificar: 33+ rutas registradas
- [ ] 16. Archivar
