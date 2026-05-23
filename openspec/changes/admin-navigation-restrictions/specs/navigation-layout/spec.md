## MODIFIED Requirements

### Requirement: Role-Based Dynamic Navigation
The system SHALL display a navigation menu with items dynamically filtered based on the authenticated user's role.

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
- **THEN** the navigation menu SHALL NOT show: Cart, Addresses, Orders (Compras/Mis Pedidos)

#### Scenario: Unauthenticated navigation menu
- **WHEN** no user is authenticated
- **THEN** the navigation menu SHALL show a minimal public navigation with Login and Register links, plus the brand logo

### Requirement: Role-Based Route Protection
The system SHALL protect frontend routes based on the user's role.

#### Scenario: Route allowed by role
- **WHEN** an authenticated user navigates to a route that allows their role
- **THEN** the route SHALL render normally

#### Scenario: Route denied by role
- **WHEN** an authenticated user navigates to a route that does not allow their role
- **THEN** the system SHALL redirect to a 403 Forbidden page

#### Scenario: ADMIN restricted from client-only routes
- **WHEN** an authenticated user with role `ADMIN` navigates to `/cart`, `/addresses`, `/orders`, or any subroute thereof
- **THEN** the system SHALL redirect to `/admin/metrics` (Dashboard) instead of rendering the page

#### Scenario: ADMIN access to catalog routes
- **WHEN** an authenticated user with role `ADMIN` navigates to `/products`, `/products/new`, or `/products/:id/edit`
- **THEN** the route SHALL render normally (ADMIN can edit catalog)

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the system SHALL redirect to /login
