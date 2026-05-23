import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth-store';
import type { UserRole } from '@/shared/config/roles';
import { hasMinRole } from '@/shared/config/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  /** Exact role match (no hierarchy). User role must be in this list. */
  allowedRoles?: UserRole[];
}

/**
 * Role-protected route that checks access.
 *
 * If `allowedRoles` is provided: exact role match — user's role must be in the list.
 * If `requiredRole` is provided: hierarchy check — user's level must meet or exceed the required level.
 * If neither: defaults to any authenticated user.
 *
 * Redirects to /login if unauthenticated, /403 if access denied.
 */
export function RoleProtectedRoute({ children, requiredRole, allowedRoles }: RoleProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    // Exact role match
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/403" replace />;
    }
  } else if (requiredRole) {
    // Hierarchy check
    if (!hasMinRole(user?.role, requiredRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
}
