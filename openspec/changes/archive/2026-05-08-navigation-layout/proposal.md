## Why

The Food Store frontend currently has a static navigation bar and a basic protected route that only checks authentication status. As we add role-specific features (catalog management for STAFF, order management for GESTOR, user administration for ADMIN), the UI must dynamically adapt its navigation, route access, and error handling based on the user's role. Without this change, users would see irrelevant links and be able to navigate to unauthorized areas.

## What Changes

- **Role-based dynamic navigation menu**: The AppLayout navbar will display menu items based on the authenticated user's role (CLIENTE, STAFF, GESTOR, ADMIN), showing only relevant links for each role
- **Role-protected routing**: `RoleProtectedRoute` will be fully implemented and integrated into the router, redirecting users to a 403 page if they lack the required role
- **Global HTTP error handling**: A centralized error notification system (toast/snackbar) will display API errors globally, intercepting HTTP 4xx/5xx responses from axios
- **Responsive navigation**: The navbar will collapse into a hamburger menu on mobile devices
- **AppLayout refactor**: Extract navigation items into a reusable configuration, clean up the existing static nav links
- **404 and 403 error pages**: Dedicated pages for not-found and forbidden errors

## Capabilities

### New Capabilities
- `navigation-layout`: Role-based dynamic navigation menu, protected routes with role-based access control (RBAC), global HTTP error handling with toast notifications, responsive layout shell with mobile menu, and dedicated 404/403 error pages

### Modified Capabilities

None — this change introduces new frontend capabilities that build on existing auth infrastructure without modifying existing spec requirements.

## Impact

- **frontend/src/widgets/layout/AppLayout.tsx**: Major refactor — dynamic menu from config, role-based visibility, mobile responsive
- **frontend/src/app/router.tsx**: Add role-based route protection, error pages (404/403)
- **frontend/src/app/ProtectedRoute.tsx**: Fully implement `RoleProtectedRoute` with role hierarchy check (ADMIN bypasses all)
- **frontend/src/shared/api/axios-instance.ts**: Add global error handler interceptor that dispatches toast notifications
- **frontend/src/shared/ui/**: New `Toast` component for global error/success notifications
- **frontend/src/pages/**: New `NotFoundPage` (upgrade existing), new `ForbiddenPage`
- **frontend/src/app/providers.tsx**: Add ToastProvider for global notification context
- No backend changes required (auth endpoints already handle roles)
