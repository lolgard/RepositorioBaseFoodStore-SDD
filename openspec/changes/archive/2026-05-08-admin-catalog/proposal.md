# Propuesta: admin-catalog

## Qué
Garantizar que ADMIN tenga acceso completo al CRUD de catálogo y gestión de pedidos.

## Por qué
El Admin debe tener control total sobre funcionalidades ya existentes.

## Dependencias
- auth-system (roles), product-catalog, category-management, ingredient-management, order-state-machine

## Nota
Ya está implementado: `require_role` tiene ADMIN bypass, `hasMinRole` tiene ADMIN bypass, `getNavItemsForRole` tiene ADMIN bypass. No requiere cambios.
