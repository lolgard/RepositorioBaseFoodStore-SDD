## Context

The frontend currently has a static `AppLayout` with hardcoded nav links, a basic `ProtectedRoute` that only checks authentication, and a `RoleProtectedRoute` skeleton that is unused. The `axios-instance.ts` already handles token refresh on 401 but has no global error notification system. As new features are added (products, orders, users), the navigation and route protection must be role-aware.

This change refactors the layout layer to be dynamic, role-driven, and responsive, while adding a global toast notification system for API errors.

## Goals / Non-Goals

**Goals:**
- Dynamic navigation menu driven by a centralized config mapping roles to visible items
- Functional `RoleProtectedRoute` with role hierarchy (CLIENTE < STAFF < GESTOR < ADMIN, ADMIN bypass)
- Global toast notification system for HTTP errors (4xx, 5xx, network)
- Responsive navbar (hamburger menu on mobile)
- Dedicated 404 and 403 error pages
- Clean separation: nav config in `shared/config/`, toast context in `shared/ui/`

**Non-Goals:**
- Backend changes (all role/permission data comes from existing auth endpoints)
- Server-side rendering or SSR improvements
- Complex animations or page transitions
- i18n/internationalization of nav items
- Breadcrumb navigation
- User notification preferences (dismiss types, positions)

## Decisions

### D1: Navigation items as a config array, not a registry pattern
Navigation items are defined as a typed constant array in `shared/config/navigation.ts`, each item specifying `label`, `path`, `icon` (optional), and `allowedRoles` array. The `AppLayout` filters this array by the current user's role.

**Why not a registry pattern?** A registry (each module self-registers its nav items) adds indirection and makes it harder to reason about the final menu. A single config file is simpler, testable, and allows the ADMIN role to see all items automatically.

**Why not an API-driven menu?** The backend already defines role permissions. Repeating that mapping on the frontend is intentional — the frontend decides what UI to show, the backend enforces access. This avoids an extra API call on every render.

### D2: Role hierarchy as a numeric map, not a tree
Roles map to numeric levels: CLIENTE=10, STAFF=20, GESTOR=30, ADMIN=99. A route requiring GESTOR (30) is accessible to GESTOR (30) and ADMIN (99), but not CLIENTE (10).

**Why not a tree/permissions matrix?** A hierarchy is simpler and matches the actual domain: each role strictly includes all permissions of lower roles. ADMIN > GESTOR > STAFF > CLIENTE. A matrix would be over-engineering for 4 roles.

### D3: Toast context with zustand, not a dedicated toast library
A lightweight toast store using zustand (`shared/store/toast-store.ts`) manages a queue of toast notifications. The `ToastProvider` renders them.

**Why not react-hot-toast or sonner?** The project already depends on zustand. Adding a toast library for what amounts to a list of messages with auto-dismiss is unnecessary. Our implementation is ~50 lines and avoids a dependency.

**Why not a React context?** A zustand store is simpler, doesn't require provider nesting, and can be accessed outside React components (e.g., in the axios interceptor).

### D4: Axios interceptor calls toast store directly, not via events
The response error interceptor in `axios-instance.ts` pushes toasts directly via `useToastStore.getState().addToast()`.

**Why not emit events or use a callback?** Direct store access from the interceptor avoids indirection. The toast store is a singleton, so `getState()` works outside React components. This is a standard pattern with zustand.

## Risks / Trade-offs

- **[Risk] Toast spam on multiple rapid errors**: If a component fires multiple requests that all fail, the user sees N toasts. → **Mitigation**: Toast store limits max visible toasts to 5 and deduplicates identical messages within 2 seconds.
- **[Risk] zustand store outside React**: While `getState()` works, components won't re-render if toast state changes via the interceptor. → **Mitigation**: The `ToastProvider` subscribes to the store and re-renders; axios interceptor only adds toasts, doesn't read them.
- **[Trade-off] Hardcoded nav roles vs API-driven**: If the backend role structure changes, the frontend nav config must be updated in sync. This is acceptable because role changes are infrequent and require coordinated deploys anyway.
- **[Risk] Mobile menu accessibility**: A hamburger menu without proper ARIA attributes breaks screen readers. → **Mitigation**: Use standard aria attributes (`aria-expanded`, `aria-label`, `role="navigation"`).
