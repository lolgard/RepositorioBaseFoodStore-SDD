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
  requiredRole: UserRole;
}

/**
 * Role-protected route that checks if the authenticated user has the minimum required role.
 * ADMIN bypasses all role checks.
 * Redirects to /403 if the user lacks the required role.
 */
export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinRole(user?.role, requiredRole)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
