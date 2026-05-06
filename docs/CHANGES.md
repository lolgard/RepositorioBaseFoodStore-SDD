# Mapa Completo de Changes — Food Store

Este documento define los **19 changes** necesarios para desarrollar Food Store de principio a fin, siguiendo el flujo OPSX (Spec-Driven Development).

El orden de implementación es **estricto**: un change debe estar archivado antes de proponer uno que dependa de él.

---

## 01. `infrastructure-setup`
- **Funcionalidad**: Scaffolding inicial del monorepo, configuración del backend (FastAPI + SQLModel + Alembic), configuración del frontend (React + Vite + Zustand + TanStack), patrones base (BaseRepository, Unit of Work, dependencias FastAPI), manejo de errores RFC 7807 y validación de inputs.
- **Historias**: US-000, US-000a, US-000b, US-000c, US-000d, US-000e, US-068, US-074
- **Dependencias**: Ninguna (es la base de todo)
- **Por qué**: Sin esta base no existe NADA. Los patrones base (UoW, BaseRepository) son usados por CADA módulo posterior.

---

## 02. `auth-system`
- **Funcionalidad**: Registro de clientes, login con JWT (access + refresh tokens), refresh de token con rotación, logout, gestión de roles RBAC (4 roles), protección de rutas por rol y rate limiting en endpoints sensibles.
- **Historias**: US-001, US-002, US-003, US-004, US-005, US-006, US-073
- **Dependencias**: `infrastructure-setup`
- **Por qué**: La autenticación es transversal. Todo el sistema necesita que los usuarios puedan registrarse y tener roles asignados.

---

## 03. `navigation-layout`
- **Funcionalidad**: Navegación adaptada por rol (menú dinámico), protección de rutas en frontend, manejo de token expirado con renovación transparente, y manejo global de errores HTTP.
- **Historias**: US-075, US-076, US-066, US-067
- **Dependencias**: `auth-system`
- **Por qué**: La UI debe saber qué mostrar según el rol del usuario antes de construir funcionalidades específicas.

---

## 04. `category-management`
- **Funcionalidad**: CRUD de categorías con soporte jerárquico (CTE recursivas), soft delete con validaciones, y listado público del árbol de categorías.
- **Historias**: US-007, US-008, US-009, US-010
- **Dependencias**: `auth-system`
- **Por qué**: Las categorías son la estructura organizativa del catálogo. Se necesitan antes de poder asociar productos.

---

## 05. `ingredient-management`
- **Funcionalidad**: CRUD de ingredientes con flag de alérgenos, listado con filtro por alérgeno, y soft delete.
- **Historias**: US-011, US-012, US-013, US-014
- **Dependencias**: `auth-system`
- **Por qué**: Los ingredientes son fundamentales para el catálogo y para que los clientes tomen decisiones informadas.

---

## 06. `product-catalog`
- **Funcionalidad**: CRUD de productos con precio (NUMERIC), stock, disponibilidad, asociación a múltiples categorías, asociación de ingredientes, listado público con filtros, detalle completo y gestión de stock.
- **Historias**: US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022, US-023
- **Dependencias**: `category-management`, `ingredient-management`
- **Por qué**: El catálogo es el corazón de la tienda. Los clientes necesitan ver productos antes de poder armar el carrito.

---

## 07. `client-profile`
- **Funcionalidad**: Visualización y edición del perfil del cliente, y cambio de contraseña con invalidación de refresh tokens.
- **Historias**: US-061, US-062, US-063
- **Dependencias**: `auth-system`
- **Por qué**: El perfil es una funcionalidad core del cliente, pero no bloquea otras features críticas.

---

## 08. `delivery-addresses`
- **Funcionalidad**: CRUD de direcciones de entrega, marcado de dirección predeterminada, y validación de ownership.
- **Historias**: US-024, US-025, US-026, US-027, US-028
- **Dependencias**: `auth-system`
- **Por qué**: Las direcciones son necesarias para que el cliente pueda crear pedidos.

---

## 09. `shopping-cart`
- **Funcionalidad**: Carrito de compras client-side con Zustand + localStorage, agregar productos, personalización (exclusión de ingredientes), modificar cantidades, eliminar items y resumen.
- **Historias**: US-029, US-030, US-031, US-032, US-033, US-034
- **Dependencias**: `product-catalog`
- **Por qué**: El carrito es el paso intermedio entre el catálogo y el pedido. Es puramente client-side.

---

## 10. `pre-checkout-validation`
- **Funcionalidad**: Validación de disponibilidad de stock y detección de cambios de precio al iniciar el checkout.
- **Historias**: US-069, US-070
- **Dependencias**: `shopping-cart`, `order-creation`
- **Por qué**: Valida que el carrito siga siendo válido antes de crear el pedido.

---

## 11. `order-creation`
- **Funcionalidad**: Creación atómica de pedidos usando Unit of Work, snapshots de precio en `DetallePedido`, snapshots de dirección en `Pedido`, validación de stock y registro en `HistorialEstadoPedido`.
- **Historias**: US-035, US-036, US-037, US-038
- **Dependencias**: `shopping-cart`, `delivery-addresses`, `product-catalog`
- **Por qué**: Crear un pedido es la operación más compleja y usa el patrón UoW.

---

## 12. `mercadopago-integration`
- **Funcionalidad**: Integración con MercadoPago Orders API, creación de preferencias de pago con idempotency key, procesamiento de webhooks IPN, consulta de estado y reintento de pago.
- **Historias**: US-045, US-046, US-047, US-048
- **Dependencias**: `order-creation`
- **Por qué**: Sin pagos, el pedido no puede avanzar de PENDIENTE. MercadoPago dispara la transición a CONFIRMADO.

---

## 13. `order-state-machine`
- **Funcionalidad**: Máquina de estados finitos (FSM) de 6 estados, transiciones validadas, decremento/ restauración de stock, y audit trail append-only.
- **Historias**: US-039, US-040, US-041, US-042, US-043, US-044
- **Dependencias**: `order-creation`, `mercadopago-integration`
- **Por qué**: La FSM es el núcleo del flujo operativo. Las transiciones deben validarse estrictamente.

---

## 14. `order-visualization`
- **Funcionalidad**: Listado de pedidos del cliente, detalle completo con snapshots e historial, listado de TODOS los pedidos para Gestor/Admin con filtros.
- **Historias**: US-049, US-050, US-051, US-052
- **Dependencias**: `order-creation`
- **Por qué**: Los clientes y gestores necesitan visibilidad del estado de los pedidos.

---

## 15. `payment-feedback`
- **Funcionalidad**: Pantalla de confirmación de pedido creado, feedback visual al retornar de MercadoPago (éxito/rechazo/pendiente).
- **Historias**: US-071, US-072
- **Dependencias**: `mercadopago-integration`, `order-visualization`
- **Por qué**: Cierra la experiencia del usuario dándole feedback claro sobre el resultado de su compra.

---

## 16. `user-administration`
- **Funcionalidad**: Panel de listado de usuarios, edición de datos y roles, y desactivación lógica de usuarios.
- **Historias**: US-053, US-054, US-055
- **Dependencias**: `auth-system`
- **Por qué**: El Admin necesita gestionar usuarios. Es independiente del catálogo y pedidos.

---

## 17. `admin-catalog`
- **Funcionalidad**: Acceso completo del Admin al CRUD de catálogo y gestión de pedidos (mismos permisos que STOCK y PEDIDOS).
- **Historias**: US-064, US-065
- **Dependencias**: `product-catalog`, `category-management`, `ingredient-management`, `order-state-machine`
- **Por qué**: El Admin debe tener control total sobre funcionalidades ya existentes.

---

## 18. `metrics-dashboard`
- **Funcionalidad**: Dashboard de métricas generales, gráfico de evolución de ventas, ranking de productos y distribución de pedidos por estado.
- **Historias**: US-056, US-057, US-058, US-059
- **Dependencias**: `order-creation`, `user-administration`
- **Por qué**: Las métricas requieren que haya pedidos y usuarios en el sistema para ser significativas.

---

## 19. `system-configuration`
- **Funcionalidad**: Panel de configuración general del sistema con parámetros operativos.
- **Historias**: US-060
- **Dependencias**: `auth-system`
- **Por qué**: Es la funcionalidad menos crítica. Una tabla key-value simple para parámetros.

---

## 📋 Resumen de Sprints

| Sprint | Changes | Épica(s) |
|--------|---------|-----------|
| 0 | `infrastructure-setup` | Epic 00 |
| 1 | `auth-system` + `navigation-layout` | Epic 01 + 02 |
| 2 | `category-management` + `ingredient-management` | Epic 03 + 04 |
| 3 | `product-catalog` + `client-profile` | Epic 05 + 06 |
| 4 | `delivery-addresses` + `shopping-cart` | Epic 07 + 08 |
| 5 | `pre-checkout-validation` + `order-creation` | Epic 09 + 10 |
| 6 | `mercadopago-integration` + `order-state-machine` | Epic 11 + 12 |
| 7 | `order-visualization` + `payment-feedback` | Epic 13 + 14 |
| 8 | `user-administration` + `admin-catalog` + `metrics-dashboard` + `system-configuration` | Epic 15 + 16 + 17 + 18 |

---

**Total: 19 changes** cubriendo las 77 historias de usuario organizadas en 19 épicas.
