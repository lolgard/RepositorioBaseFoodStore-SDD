/**
 * Role hierarchy configuration and helper utilities.
 *
 * Roles are mapped to numeric levels for easy comparison.
 * ADMIN (99) has access to all routes regardless of required role.
 */
export const ROLE_HIERARCHY = {
  CLIENTE: 10,
  STAFF: 20,
  GESTOR: 30,
  ADMIN: 99,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

/**
 * Checks if the user's role meets or exceeds the minimum required role.
 * ADMIN always passes regardless of the required role.
 */
export function hasMinRole(
  userRole: UserRole | undefined | null,
  requiredRole: UserRole,
): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  // ADMIN bypasses all role checks
  if (userRole === 'ADMIN') return true;
  return userLevel >= requiredLevel;
}

/**
 * Checks if a role level is at least the given minimum.
 * Useful for comparing raw role values without a user context.
 */
export function isRoleAtLeast(
  role: UserRole | undefined | null,
  minRole: UserRole,
): boolean {
  if (!role) return false;
  const roleLevel = ROLE_HIERARCHY[role];
  const minLevel = ROLE_HIERARCHY[minRole];
  if (role === 'ADMIN') return true;
  return roleLevel >= minLevel;
}
