## Why

Actualmente el ADMIN ve TODAS las secciones de la aplicación (incluyendo carrito, direcciones y pedidos de cliente) porque el sistema de navegación tiene un bypass `role === 'ADMIN'` que muestra todo. Además, cuando un admin inicia sesión, no hay una redirección específica al Dashboard. Esto genera una experiencia confusa: un admin no necesita carrito de compras, direcciones de envío ni la sección "Mis Pedidos" como cliente; en cambio, debería ver su Dashboard por defecto.

## What Changes

- **Admin default redirect**: Al iniciar sesión como ADMIN, redirigir automáticamente al Dashboard (`/admin/metrics`). La ruta raíz `/` también debe redirigir al Dashboard para usuarios ADMIN.
- **Admin navigation restrictions**: Remover del menú de navegación para ADMIN las secciones de Carrito (Cart), Direcciones (Addresses) y Pedidos (Orders/Mis Compras).
- **Admin route protection**: Bloquear el acceso directo a rutas de Carrito, Direcciones y Pedidos para usuarios ADMIN (redirigir a 403 o al Dashboard).
- **Admin keeps Catalog**: ADMIN mantiene acceso completo al Catálogo (Products) para editarlo, junto con Ingredients, Categories, Users, System Config y Dashboard.

## Capabilities

### New Capabilities
- `admin-redirect-dashboard`: Redirección automática al Dashboard para usuarios ADMIN al iniciar sesión o al acceder a la raíz.

### Modified Capabilities
- `navigation-layout`: Los escenarios de navegación para ADMIN deben actualizarse: ADMIN ya no debe ver Cart, Addresses ni Orders en el menú. Debe mantener Dashboard, Products, Ingredients, Categories, Users, System Config y Profile.
- `role-management`: El bypass de ADMIN en rutas protegidas debe ajustarse para excluir explícitamente las rutas de Cart, Addresses y Orders (que son exclusivas de CLIENTE).

## Impact

- **Frontend**:
  - `frontend/src/shared/config/navigation.ts` — Modificar `getNavItemsForRole` y `NAV_ITEMS` para que ADMIN no tenga bypass total
  - `frontend/src/app/router.tsx` — Agregar redirect condicional para ADMIN en ruta raíz, ajustar protección de rutas
  - `frontend/src/widgets/layout/AppLayout.tsx` — La navegación se actualizará automáticamente al cambiar la config
  - `frontend/src/shared/config/roles.ts` — Ajustar `hasMinRole` o crear lógica específica para excluir rutas de cliente para ADMIN
  - `frontend/src/pages/login/LoginPage.tsx` — Posiblemente ajustar redirect post-login según rol
  - `frontend/src/app/ProtectedRoute.tsx` — Ajustar lógica de protección para ADMIN
- **Backend**: Sin cambios (el backend ya tiene sus propias verificaciones de rol)
