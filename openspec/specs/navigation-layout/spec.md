## ADDED Requirements

### Requirement: Role-Based Dynamic Navigation
The system SHALL display a navigation menu with items dynamically filtered based on the authenticated user's role.

#### Scenario: CLIENTE navigation menu
- **WHEN** a user with role `CLIENTE` is authenticated
- **THEN** the navigation menu SHALL show: Home, Profile, and Logout

#### Scenario: STAFF navigation menu
- **WHEN** a user with role `STAFF` is authenticated
- **THEN** the navigation menu SHALL show: Home, Products, Ingredients, Categories, Profile, and Logout

#### Scenario: GESTOR navigation menu
- **WHEN** a user with role `GESTOR` is authenticated
- **THEN** the navigation menu SHALL show: Home, Orders, Profile, and Logout

#### Scenario: ADMIN navigation menu
- **WHEN** a user with role `ADMIN` is authenticated
- **THEN** the navigation menu SHALL show: All available links including Home, Products, Ingredients, Categories, Orders, Users, Profile, and Logout

#### Scenario: Unauthenticated navigation menu
- **WHEN** no user is authenticated
- **THEN** the navigation menu SHALL show: Login and Register

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
The system SHALL protect frontend routes based on the user's role, with ADMIN having access to all routes.

#### Scenario: Route allowed by role
- **WHEN** an authenticated user navigates to a route that allows their role
- **THEN** the route SHALL render normally

#### Scenario: Route denied by role
- **WHEN** an authenticated user navigates to a route that does not allow their role
- **THEN** the system SHALL redirect to a 403 Forbidden page

#### Scenario: ADMIN bypasses role checks
- **WHEN** an authenticated user with role `ADMIN` navigates to any protected route
- **THEN** the route SHALL render regardless of the required role

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the system SHALL redirect to /login

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
