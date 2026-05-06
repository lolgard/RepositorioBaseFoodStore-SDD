import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/auth-store';

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

// Role-based Protected Route (for future use)
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
