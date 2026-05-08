import type { UserRole } from './roles';

/**
 * Navigation item definition.
 * Each item specifies its label, path, optional icon, and which roles can see it.
 */
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  allowedRoles: UserRole[];
}

/**
 * Centralized navigation configuration.
 *
 * Items are ordered as they should appear in the navigation bar.
 * The `allowedRoles` array defines which roles can see each item.
 * ADMIN sees all items regardless of the allowedRoles array.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    allowedRoles: ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'],
  },
  {
    label: 'Products',
    path: '/products',
    icon: '📦',
    allowedRoles: ['STAFF', 'ADMIN'],
  },
  {
    label: 'Ingredients',
    path: '/ingredients',
    icon: '🥘',
    allowedRoles: ['STAFF', 'ADMIN'],
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: '📂',
    allowedRoles: ['STAFF', 'ADMIN'],
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: '📋',
    allowedRoles: ['GESTOR', 'ADMIN'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: '👥',
    allowedRoles: ['ADMIN'],
  },
  {
    label: 'Profile',
    path: '/profile',
    allowedRoles: ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'],
  },
];

/**
 * Filters navigation items based on the user's role.
 * ADMIN sees all items — the frontend shows what's available,
 * and the backend enforces access at the API level.
 */
export function getNavItemsForRole(role: UserRole | undefined | null): NavItem[] {
  if (!role) {
    // Unauthenticated users see nothing in the main nav
    return [];
  }
  return NAV_ITEMS.filter(
    (item) => item.allowedRoles.includes(role) || role === 'ADMIN',
  );
}
