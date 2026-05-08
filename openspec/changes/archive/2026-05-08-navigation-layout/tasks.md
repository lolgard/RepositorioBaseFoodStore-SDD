## 1. Navigation Configuration & Utilities

- [x] 1.1 Create `frontend/src/shared/config/navigation.ts` with typed navigation items array, each item with `label`, `path`, `icon` (optional), and `allowedRoles` array
- [x] 1.2 Create `frontend/src/shared/config/roles.ts` with role hierarchy map (CLIENTE=10, STAFF=20, GESTOR=30, ADMIN=99) and helper functions: `hasMinRole(userRole, requiredRole)`, `isRoleAtLeast(role, minRole)`

## 2. Toast Notification System

- [x] 2.1 Create `frontend/src/shared/store/toast-store.ts` with zustand store managing a queue of toasts (message, type, id), max 5 visible toasts, auto-dismiss after 5s, deduplication of identical messages within 2s
- [x] 2.2 Create `frontend/src/shared/ui/Toast.tsx` component rendering individual toast with message, type icon (success/error/info/warning), and close button
- [x] 2.3 Create `frontend/src/shared/ui/ToastContainer.tsx` component that reads from toast store and positions toasts in fixed top-right corner
- [x] 2.4 Create `frontend/src/shared/ui/ToastProvider.tsx` context provider that initializes toast subscription
- [x] 2.5 Add `ToastProvider` to `frontend/src/app/providers.tsx`

## 3. Global Error Handler (Axios Interceptor)

- [x] 3.1 Update `frontend/src/shared/api/axios-instance.ts` to add a response error interceptor that extracts error messages and dispatches toasts via toast store for 4xx, 5xx, and network errors
- [x] 3.2 Ensure the error interceptor does not interfere with existing 401 token refresh logic

## 4. Role-Based Route Protection

- [x] 4.1 Implement `RoleProtectedRoute` in `frontend/src/app/ProtectedRoute.tsx` with full role hierarchy check (uses `hasMinRole` from roles config, ADMIN bypasses all checks, redirects to /403 on insufficient role)
- [x] 4.2 Create `frontend/src/pages/forbidden/ForbiddenPage.tsx` with 403 message and "Go Home" button
- [x] 4.3 Upgrade `frontend/src/pages/NotFoundPage.tsx` with proper 404 message and "Go Home" button (create if doesn't exist)

## 5. AppLayout Refactor

- [x] 5.1 Refactor `frontend/src/widgets/layout/AppLayout.tsx` to use dynamic navigation from `navigation.ts` config, filtering items based on current user's role
- [x] 5.2 Add responsive hamburger menu for mobile viewports (< 768px) with accessible ARIA attributes
- [x] 5.3 Clean up hardcoded nav links and replace with dynamic rendering from config

## 6. Router Integration

- [x] 6.1 Update `frontend/src/app/router.tsx` to add /403 and /404 routes with ForbiddenPage and NotFoundPage respectively
- [x] 6.2 Add role-protected route example (wrap future STAFF routes with RoleProtectedRoute) — routes for products, orders, etc. will be added by their respective changes
