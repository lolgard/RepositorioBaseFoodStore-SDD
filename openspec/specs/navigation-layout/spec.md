# Navigation Layout

## Purpose
Define the application navigation structure and role-based access control.
## Requirements
### Requirement: Role-Based Dynamic Navigation
The system SHALL display a navigation menu with items dynamically filtered based on the authenticated user's role. For unauthenticated users, a public navigation with limited items SHALL be shown.

#### Scenario: CLIENTE navigation menu
- **WHEN** a user with role `CLIENTE` is authenticated
- **THEN** the navigation menu SHALL show: Home, Catalog, Orders, Addresses, Cart, Profile, and Logout

#### Scenario: STAFF navigation menu
- **WHEN** a user with role `STAFF` is authenticated
- **THEN** the navigation menu SHALL show: Home, Products, Ingredients, Categories, Profile, and Logout

#### Scenario: GESTOR navigation menu
- **WHEN** a user with role `GESTOR` is authenticated
- **THEN** the navigation menu SHALL show: Home, Orders, Profile, and Logout

#### Scenario: ADMIN navigation menu
- **WHEN** a user with role `ADMIN` is authenticated
- **THEN** the navigation menu SHALL show: Dashboard, Products, Ingredients, Categories, Users, System Config, Profile, and Logout
- **THEN** the navigation menu SHALL NOT show: Cart, Addresses, Orders

#### Scenario: Guest navigation menu
- **WHEN** no user is authenticated
- **THEN** the navigation menu SHALL show: Catálogo, Carrito, Iniciar Sesión, Registrarse

### Requirement: Navigation Item Configuration
The system SHALL define navigation items in a centralized configuration object that maps each role to its visible menu items.

#### Scenario: Centralized nav config
- **WHEN** the navigation system initializes
- **THEN** each navigation item SHALL have: label, path, icon (optional), and an array of allowed roles

#### Scenario: New role support
- **WHEN** a new role is added
- **THEN** adding menu items for that role SHALL only require updating the navigation configuration, not modifying components

### Requirement: Responsive Navigation
The system SHALL provide a responsive navigation that collapses into a hamburger menu on mobile viewports.

#### Scenario: Desktop navigation
- **WHEN** the viewport width is 768px or greater
- **THEN** the navigation menu SHALL display as a horizontal bar with all visible links

#### Scenario: Mobile navigation
- **WHEN** the viewport width is less than 768px
- **THEN** the navigation SHALL collapse into a hamburger menu button that toggles a vertical menu overlay

### Requirement: Role-Based Route Protection
The system SHALL protect frontend routes based on the user's role, while allowing public access to catalog and cart routes.

#### Scenario: Public route access
- **WHEN** any user (authenticated or not) navigates to `/products`, `/products/:id`, or `/cart`
- **THEN** the route SHALL render normally without authentication checks

#### Scenario: Route allowed by role
- **WHEN** an authenticated user navigates to a route that allows their role
- **THEN** the route SHALL render normally

#### Scenario: Route denied by role
- **WHEN** an authenticated user navigates to a route that does not allow their role
- **THEN** the system SHALL redirect to a 403 Forbidden page

#### Scenario: ADMIN restricted from client-only routes
- **WHEN** an authenticated user with role `ADMIN` navigates to `/cart`, `/addresses`, `/orders`, or any subroute thereof
- **THEN** the system SHALL redirect to `/admin/metrics` (Dashboard) instead of rendering the page

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated user navigates to a route that requires authentication (e.g., `/orders`, `/profile`, `/addresses`, `/checkout`)
- **THEN** the system SHALL redirect to `/login`

### Requirement: Global HTTP Error Handling
The system SHALL intercept and display HTTP errors globally via a toast notification system.

#### Scenario: 4xx error notification
- **WHEN** an API request returns a 4xx status code
- **THEN** the system SHALL display a toast notification with the error message from the response

#### Scenario: 5xx error notification
- **WHEN** an API request returns a 5xx status code
- **THEN** the system SHALL display a generic "Server error. Please try again later." toast notification

#### Scenario: Network error notification
- **WHEN** an API request fails due to a network error
- **THEN** the system SHALL display a "Network error. Check your connection." toast notification

#### Scenario: Toast auto-dismiss
- **WHEN** a toast notification is displayed
- **THEN** it SHALL auto-dismiss after 5 seconds, or SHALL be dismissable by clicking a close button

### Requirement: Error Pages
The system SHALL provide dedicated error pages for 404 (Not Found) and 403 (Forbidden) scenarios.

#### Scenario: 404 page
- **WHEN** a user navigates to a non-existent route
- **THEN** the system SHALL display a 404 page with a "Go Home" button

#### Scenario: 403 page
- **WHEN** a user is redirected due to insufficient role permissions
- **THEN** the system SHALL display a 403 page with a "Go Home" button and a message indicating access is denied

### Requirement: Guest navigation menu
The system SHALL display a minimal navigation menu for unauthenticated users, allowing them to browse the catalog, view their cart, login, or register.

#### Scenario: Guest navigation items
- **WHEN** no user is authenticated
- **THEN** the navigation menu SHALL show: Catálogo (link to `/products`), Carrito (link to `/cart`), Iniciar Sesión (link to `/login`), and Registrarse (link to `/register`)
- **THEN** the navigation SHALL also show the FoodStore brand logo linking to `/`

#### Scenario: Guest cart badge
- **WHEN** an unauthenticated user has items in their cart (localStorage)
- **THEN** the cart icon in the navigation SHALL display a badge with the total item count

#### Scenario: Guest mobile navigation
- **WHEN** an unauthenticated user accesses the site on a mobile viewport
- **THEN** the header SHALL show a hamburger menu with the same public navigation items (Catálogo, Carrito, Iniciar Sesión, Registrarse)

#### Scenario: Guest sees login/register
- **WHEN** no user is authenticated
- **THEN** the navigation SHALL NOT show profile, orders, addresses, or any user-specific sections
- **THEN** the navigation SHALL show prominent Login and Register buttons/links

