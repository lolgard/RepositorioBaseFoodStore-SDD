## 1. Router — hacer rutas públicas y redirigir raíz

- [x] 1.1 Remover `ProtectedRoute` de las rutas `/products` (listado), `/products/:id` (detalle) y `/cart` en `router.tsx`
- [x] 1.2 Cambiar la ruta raíz `/` para que renderice `ProductListPage` (catálogo) públicamente, sin `ProtectedRoute`
- [x] 1.3 Mover `HomePage` a una ruta separada `/home` como landing alternativa pública

## 2. Navigation — agregar navegación pública para invitados

- [x] 2.1 Modificar `getNavItemsForRole()` en `navigation.ts` para que acepte `null` como rol invitado y filtre items con flag `public`
- [x] 2.2 Agregar items de navegación pública en `NAV_ITEMS`: Catálogo (`/products`) y Carrito (`/cart`) con `public: true`
- [x] 2.3 Agregar botones de Login/Register en la nav para invitados (manejado en AppLayout)

## 3. AppLayout — soportar modo público (sin autenticación)

- [x] 3.1 Modificar `AppLayout` para que se renderice sin usuario autenticado, mostrando navegación pública (Catálogo, Carrito con badge, Login/Register)
- [x] 3.2 Ocultar secciones de "Mi Cuenta" y "Administración" cuando no hay usuario autenticado (viene por defecto de getNavItemsForRole)
- [x] 3.3 En mobile header, mostrar el icono de carrito con badge incluso para usuarios no autenticados
- [x] 3.4 En lugar del perfil en la sidebar/bottom, mostrar botones de "Iniciar Sesión" y "Registrarse" para invitados

## 4. CartPage — gating de checkout por autenticación

- [x] 4.1 En `CartPage`, modificar el botón "Finalizar Compra" para que verifique `isAuthenticated`: si no está autenticado, mostrar botón "Iniciar Sesión para Comprar" que redirige a `/login?redirect=/cart`
- [x] 4.2 Si el usuario está autenticado pero el rol no es CLIENTE, mantener el mensaje actual de "Cuenta Administrativa no puede realizar pedidos"
- [x] 4.3 Mantener la funcionalidad de carrito (agregar, quitar, actualizar cantidades) funcionando sin autenticación

## 5. Login — soportar redirect post-login

- [x] 5.1 Modificar `LoginPage` para leer el query param `redirect` de la URL
- [x] 5.2 Después de login exitoso, redirigir a `redirect` si existe, o usar `getDefaultRouteForRole()` si no
- [x] 5.3 Asegurar que el redirect funcione correctamente con la ruta `/cart` (el carrito mantiene su estado después del login porque usa persist de Zustand)
