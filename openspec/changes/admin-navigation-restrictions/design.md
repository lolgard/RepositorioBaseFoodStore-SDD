## Context

Actualmente el sistema de navegación del frontend tiene un bypass donde `role === 'ADMIN'` en `getNavItemsForRole()` muestra TODOS los items del menú, incluyendo secciones que no tienen sentido para un administrador (carrito, direcciones, pedidos como cliente). Además, no hay una redirección post-login específica para ADMIN — todos los usuarios van a la HomePage.

El frontend está construido con React + TypeScript + Zustand para auth state, y usa `react-router-dom` para el enrutamiento con `ProtectedRoute` y `RoleProtectedRoute`.

## Goals / Non-Goals

**Goals:**
- Al iniciar sesión como ADMIN, redirigir automáticamente al Dashboard (`/admin/metrics`)
- La ruta raíz `/` debe redirigir al Dashboard para usuarios ADMIN
- ADMIN no debe ver en el menú de navegación: Cart, Addresses, Orders
- ADMIN debe mantener acceso a: Catalog (Products), Ingredients, Categories, Users, Dashboard, System Config, Profile
- Bloquear el acceso directo por URL a rutas de Cart, Addresses y Orders para ADMIN

**Non-Goals:**
- No se modifican los permisos del backend (el backend ya tiene sus propios controles)
- No se cambia el comportamiento para CLIENTE, STAFF o GESTOR
- No se agregan nuevos roles ni se modifica la jerarquía existente

## Decisions

### Decisión 1: Eliminar el bypass `role === 'ADMIN'` en `getNavItemsForRole`

**Decisión**: Modificar `getNavItemsForRole()` para que ADMIN use los mismos filtros que cualquier otro rol, en lugar del bypass actual.

**Alternativa considerada**: Mantener el bypass y agregar exclusiones específicas para ADMIN. Se descartó porque es más frágil — cada nuevo item habría que acordarse de excluirlo. Con filtros explícitos, cada nav item define claramente qué roles pueden verlo.

**Implementación**: Cambiar la línea `return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role) || role === 'ADMIN');` por simplemente `return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));`. Luego ajustar los `allowedRoles` de Cart, Addresses y Orders para que no incluyan a ADMIN.

### Decisión 2: Centralizar la lógica de redirect post-login

**Decisión**: Crear un hook o utilidad `useRedirectByRole()` que determine a dónde redirigir según el rol del usuario después del login.

**Alternativa considerada**: Poner la lógica directamente en `LoginPage`. Se descartó porque también necesitamos el redirect en la ruta raíz y potencialmente en otros lugares.

**Implementación**: 
- Crear `frontend/src/shared/lib/redirect-by-role.ts` con una función `getDefaultRouteForRole(role)` que devuelva:
  - `ADMIN` → `/admin/metrics`
  - `CLIENTE`, `STAFF`, `GESTOR` → `/products` (catálogo)
  - `null` (no auth) → `/login`

### Decisión 3: Ajustar `RoleProtectedRoute` para ADMIN

**Decisión**: Modificar `RoleProtectedRoute` y agregar rutas explicitamente excluidas para ADMIN (Cart, Addresses, Orders) en lugar de permitir el bypass total de ADMIN.

**Alternativa considerada**: Crear un `AdminExcludedRoute` component separado. Se descartó por simplicidad — es más mantenible tener la lógica centralizada.

**Implementación**: Agregar un `excludedRoles` prop opcional a `RoleProtectedRoute`, o crear una lista de rutas excluidas para ADMIN. Las rutas de Cart (`/cart`), Addresses (`/addresses`, `/addresses/new`, `/addresses/:id/edit`) y Orders (`/orders`, `/orders/:id`) deben redirigir a `/admin/metrics` si el usuario es ADMIN.

## Risks / Trade-offs

- **[Riesgo] Admin pierde acceso a algo por error**: Al eliminar el bypass, si un item no tiene `ADMIN` en `allowedRoles`, el admin no lo verá. → **Mitigación**: Revisar explícitamente los `allowedRoles` de cada item existente y asegurar que ADMIN esté incluido donde corresponda (Products, Ingredients, Categories, Dashboard, System Config, Users, Profile).
- **[Riesgo] Redirect cíclico**: Si el admin se redirige al dashboard pero el dashboard también requiere rol ADMIN (lo hace), podría haber un loop si la verificación falla. → **Mitigación**: El dashboard ya usa `RoleProtectedRoute requiredRole="ADMIN"`, el admin cumple el rol, no hay loop.
- **[Trade-off] Los items de navegación ahora definen explícitamente roles**: Más mantenible pero requiere actualizar `NAV_ITEMS` si se agregan nuevos roles.
