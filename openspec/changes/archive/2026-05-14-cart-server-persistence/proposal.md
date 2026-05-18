# Proposal: Cart Server Persistence

## Why
Actualmente el carrito vive solo en el cliente (localStorage). Si el usuario cambia de dispositivo o limpia el caché, pierde su progreso. Necesitamos persistir el carrito en el backend para usuarios autenticados.

## What Changes
- Crear modelo `Cart` y `CartItem` en backend.
- Crear endpoints para sincronizar, obtener y limpiar el carrito en servidor.
- Modificar el estado del carrito en frontend para sincronizar con el backend al loguear.

## Impact
- Cambios en el backend (DB models, routers).
- Cambios en el estado global del frontend (Zustand store).
- Mejora sustancial en la experiencia de usuario multidispositivo.
