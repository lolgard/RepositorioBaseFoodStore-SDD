## Why

Actualmente todas las rutas del frontend están protegidas con `ProtectedRoute`, obligando a los usuarios a iniciar sesión incluso solo para ver el catálogo de productos. Esto es una barrera de entrada innecesaria: un usuario que llega a la página debería poder explorar productos, ver detalles y armar su carrito sin compromiso. Solo debería necesitar registrarse en el momento de finalizar la compra (checkout).

## What Changes

- **Catálogo como página principal**: La raíz `/` redirige a `/products` (el catálogo de productos) para usuarios no autenticados, o directamente muestra el catálogo en `/`.
- **Rutas públicas**: `/products`, `/products/:id` (detalle) y `/cart` pasan a ser públicas — no requieren autenticación.
- **Checkout requiere autenticación**: El botón de "Finalizar Compra" en el carrito redirige a `/login` si el usuario no está autenticado, o muestra el formulario de checkout si lo está.
- **Nav pública para invitados**: Los usuarios no autenticados ven una navegación con enlaces a Catálogo, Carrito, Iniciar Sesión y Registrarse.
- **HomePage como landing opcional**: La HomePage actual (hero) puede seguir existiendo como landing para no autenticados, o redirigir al catálogo directamente.

## Capabilities

### New Capabilities
- `public-catalog`: Catálogo de productos visible sin autenticación, con exploración, filtros y búsqueda.

### Modified Capabilities
- `navigation-layout`: Agregar escenario para navegación de usuarios no autenticados (guest nav). El `AppLayout` debe poder renderizarse sin autenticación. Modificar escenario de ruta protegida para rutas públicas.
- `user-auth`: El flujo de checkout requiere autenticación. Si el usuario no está autenticado e intenta comprar, se le redirige a login.

## Impact

- **Frontend**:
  - `frontend/src/app/router.tsx` — Remover `ProtectedRoute` de `/products`, `/products/:id`, `/cart`. Agregar redirect `/` → `/products` para no autenticados. Ajustar `AppLayout` para funcionar sin auth.
  - `frontend/src/widgets/layout/AppLayout.tsx` — Modificar para mostrar navegación pública cuando no hay usuario autenticado. Agregar links a Catálogo, Carrito, Login/Register.
  - `frontend/src/shared/config/navigation.ts` — Agregar items de navegación pública para invitados.
  - `frontend/src/shared/config/roles.ts` — Posiblemente ajustar para soportar `null` role como invitado.
  - `frontend/src/pages/cart/CartPage.tsx` — Si no hay usuario autenticado, el botón de checkout redirige a `/login` en vez de mostrar el modal.
  - `frontend/src/shared/lib/redirect-by-role.ts` — (creado en cambio anterior) también manejar redirect post-login.
- **Backend**: Sin cambios (el endpoint de productos ya es público, el carrito usa localStorage)
