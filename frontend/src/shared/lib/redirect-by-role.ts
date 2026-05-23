import type { UserRole } from '@/shared/config/roles';

/**
 * Returns the default route for a given role.
 * Used after login to redirect users to their appropriate landing page.
 */
export function getDefaultRouteForRole(role: UserRole | undefined | null): string {
  if (!role) return '/login';

  switch (role) {
    case 'ADMIN':
      return '/admin/metrics';
    case 'CLIENTE':
    case 'STAFF':
    case 'GESTOR':
      return '/products';
    default:
      return '/products';
  }
}
