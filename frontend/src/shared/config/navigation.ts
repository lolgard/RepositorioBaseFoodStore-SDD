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
  /** If true, shown to unauthenticated (guest) users */
  public?: boolean;
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
    path: '/home',
    allowedRoles: ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'],
  },
  {
    label: 'Catálogo',
    path: '/products',
    icon: '📦',
    allowedRoles: ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'],
    public: true,
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
    allowedRoles: ['CLIENTE', 'GESTOR'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: '👥',
    allowedRoles: ['ADMIN'],
  },
  {
    label: 'Addresses',
    path: '/addresses',
    icon: '📍',
    allowedRoles: ['CLIENTE'],
  },
  {
    label: 'Profile',
    path: '/profile',
    allowedRoles: ['CLIENTE', 'STAFF', 'GESTOR', 'ADMIN'],
  },
  {
    label: 'Cart',
    path: '/cart',
    icon: '🛒',
    allowedRoles: ['CLIENTE'],
    public: true,
  },
  {
    label: 'System Config',
    path: '/admin/config',
    icon: '\u2699\uFE0F',
    allowedRoles: ['ADMIN'],
  },
  {
    label: 'Dashboard',
    path: '/admin/metrics',
    icon: '\uD83D\uDCCA',
    allowedRoles: ['ADMIN'],
  },
];

/**
 * Filters navigation items based on the user's role.
 * ADMIN sees all items — the frontend shows what's available,
 * and the backend enforces access at the API level.
 * Unauthenticated users see items marked as `public`.
 */
export function getNavItemsForRole(role: UserRole | undefined | null): NavItem[] {
  if (!role) {
    // Unauthenticated users see public navigation items (Catalog, Cart)
    return NAV_ITEMS.filter((item) => item.public);
  }
  return NAV_ITEMS.filter(
    (item) => item.allowedRoles.includes(role),
  );
}
