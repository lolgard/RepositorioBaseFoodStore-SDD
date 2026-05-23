## Context

Actualmente el router del frontend envuelve todas las rutas principales con `ProtectedRoute`, lo que significa que cualquier visitante no autenticado es redirigido a `/login` inmediatamente. Esto incluye el catálogo de productos, el detalle de producto y el carrito de compras.

El carrito usa Zustand con `persist` (localStorage), por lo que no requiere APIs autenticadas para funcionar. El backend ya expone `/api/v1/products` como endpoint público. El único flujo que requiere autenticación es la creación de órdenes (checkout).

## Goals / Non-Goals

**Goals:**
- El catálogo de productos (`/products`) debe ser accesible sin autenticación
- El detalle de producto (`/products/:id`) debe ser accesible sin autenticación
- El carrito (`/cart`) debe ser accesible sin autenticación
- La raíz `/` debe mostrar el catálogo (o redirigir a `/products`) para usuarios no autenticados
- Los usuarios no autenticados deben poder agregar/remover items del carrito
- El checkout (finalizar compra) debe requerir autenticación — redirigir a `/login` si no hay sesión
- Los usuarios no autenticados deben ver un menú de navegación con Catálogo, Carrito, Iniciar Sesión y Registrarse

**Non-Goals:**
- No se cambia la lógica del backend (productos ya es público, carrito usa localStorage)
- No se modifican los permisos de backend
- No se agrega funcionalidad de wishlist ni otras features

## Decisions

### Decisión 1: AppLayout público + condicional

**Decisión**: Modificar `AppLayout` para que se renderice tanto para usuarios autenticados como no autenticados, mostrando una navegación reducida para invitados.

**Alternativa considerada**: Crear un `PublicLayout` separado. Se descartó porque duplica lógica y el `AppLayout` ya tiene toda la estructura necesaria (sidebar, header mobile, footer). Es más mantenible tener un solo layout con comportamiento condicional.

**Implementación**: Las rutas públicas usan `AppLayout` pero sin `ProtectedRoute`. El layout detecta si hay usuario autenticado y muestra los items de navegación correspondientes.

### Decisión 2: Navegación pública con items específicos para guest

**Decisión**: Agregar al `NAV_ITEMS` la posibilidad de definir `allowedRoles` que incluya `null` (invitado), o crear un array separado `PUBLIC_NAV_ITEMS`.

**Alternativa considerada**: Modificar `getNavItemsForRole` para aceptar `null` y tener items con `allowedRoles` que incluyan `null`. Esta es más limpia porque unifica el sistema de navegación.

**Implementación**: Extender `getNavItemsForRole` para aceptar `UserRole | undefined | null` y filtrar items cuyo `allowedRoles` incluya el valor. Agregar items público (Catálogo, Carrito con badge) con `allowedRoles` que incluya `null`.

### Decisión 3: Checkout gated por autenticación

**Decisión**: En `CartPage`, si el usuario no está autenticado, el botón de "Finalizar Compra" redirige a `/login?redirect=/cart` en lugar de abrir el modal de checkout.

**Alternativa considerada**: Mostrar el modal de checkout pero pedir login dentro del modal. Se descartó por simplicidad — redirigir a login es el patrón estándar y evita duplicar lógica de formularios.

**Implementación**: Verificar `isAuthenticated` en el store. Si no está autenticado, usar `navigate('/login?redirect=/cart')`. Luego en `LoginPage`, después de login exitoso, redirigir a `redirect` si existe en query params.

### Decisión 4: Raíz `/` pública mostrando el catálogo

**Decisión**: La ruta `/` será pública y mostrará el `ProductListPage` (catálogo) para todos los usuarios. La `HomePage` actual (hero) se moverá a una ruta separada `/home` o se mantendrá como landing solo para no autenticados.

**Alternativa considerada**: Redirigir `/` → `/products`. Se eligió esta alternativa por simplicidad — es más directo que tener dos rutas que muestran contenido similar.

**Implementación**: La ruta `/` redirige a `/products`. El `ProductListPage` se convierte en la landing page principal.

## Risks / Trade-offs

- **[Riesgo] Usuarios autenticados pierden acceso a HomePage**: Si movemos la HomePage actual, los usuarios logueados ya no verán el hero. → **Mitigación**: La HomePage actual es puramente marketing. Los usuarios logueados ya usan el catálogo como punto de entrada natural.
- **[Riesgo] Carrito sin sesión = datos en localStorage**: Si el usuario cambia de dispositivo o limpia el localStorage, pierde el carrito. → **Mitigación**: Este es el comportamiento esperado para un carrito de invitado. Al registrarse/iniciar sesión, el carrito se mantiene porque Zustand persist lo conserva en el mismo navegador. En el futuro se podría sincronizar con backend.
- **[Trade-off] AppLayout más complejo**: Al tener que manejar estados autenticado/no autenticado, el layout tiene más condicionales. Es aceptable porque evita duplicar la estructura visual.
