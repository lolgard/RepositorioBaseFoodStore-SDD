# Design: admin-catalog

No requiere cambios de implementación. El ADMIN bypass está implementado en:
- Backend: `require_role()` en `dependencies.py` línea 84
- Frontend: `hasMinRole()` en `roles.ts` línea 28 y `getNavItemsForRole()` en `navigation.ts` línea 93

ADMIN ve todos los nav items y accede a todas las rutas protegidas.
