## 1. Navigation config — definir roles explícitamente en NAV_ITEMS

- [x] 1.1 Modificar `getNavItemsForRole()` en `navigation.ts` para eliminar el bypass `role === 'ADMIN'`, usando solo `item.allowedRoles.includes(role)`
- [x] 1.2 Actualizar `allowedRoles` de cada NAV_ITEM: Cart → solo `['CLIENTE']`, Addresses → solo `['CLIENTE']`, Orders → `['CLIENTE', 'GESTOR']` (sacar ADMIN), Dashboard → `['ADMIN']`, System Config → `['ADMIN']`
- [x] 1.3 Verificar que Catalog (Products), Ingredients, Categories, Profile tengan `['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN']` en allowedRoles

## 2. Utilidad de redirect por rol

- [x] 2.1 Crear `frontend/src/shared/lib/redirect-by-role.ts` con función `getDefaultRouteForRole(role)` que retorne `/admin/metrics` para ADMIN y `/products` para demás roles autenticados

## 3. Login redirect — redirigir según rol después de login

- [x] 3.1 Modificar `LoginPage.tsx` para que después de login exitoso use `getDefaultRouteForRole()` para redirigir (admin → `/admin/metrics`, clientes → `/products`)

## 4. Root route — redirect condicional para ADMIN

- [x] 4.1 Modificar `router.tsx` para que la ruta `/` detecte si el usuario es ADMIN y en ese caso renderice un `<Navigate to="/admin/metrics" />` en lugar del HomePage

## 5. Route protection — bloquear rutas de cliente para ADMIN

- [x] 5.1 Modificar `router.tsx` para que las rutas `/cart`, `/addresses/*`, `/orders/*` tengan un `RoleProtectedRoute requiredRole="CLIENTE"` (así ADMIN no pasa porque su rol no es CLIENTE) o crear una exclusión explícita
- [x] 5.2 Verificar que ADMIN pueda acceder a `/products`, `/products/new`, `/products/:id/edit` (ya tiene acceso vía STAFF)
- [x] 5.3 Verificar que ADMIN pueda acceder a `/profile`

## 6. AppLayout — ajustar agrupación de navegación

- [x] 6.1 Revisar que los grupos de navegación (shopItems, accountItems, adminItems) se actualicen correctamente con los nuevos filtros
- [x] 6.2 El icono flotante de carrito en mobile header debe ocultarse para ADMIN (línea 382: `{(!user || user?.role === 'CLIENTE') && (` ya funciona correctamente)
