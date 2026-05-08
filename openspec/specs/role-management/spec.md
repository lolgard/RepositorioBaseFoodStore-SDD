## ADDED Requirements

### Requirement: Role Definition
The system SHALL define four roles with hierarchical permissions: Cliente, Staff, Gestor, Admin.

#### Scenario: Role hierarchy
- **WHEN** the system is initialized
- **THEN** the following roles exist:
  - `CLIENTE`: Basic access — view catalog, manage own cart/orders/profile
  - `STAFF`: Inventory access — manage products, categories, ingredients, stock
  - `GESTOR`: Order management — view and manage all orders, update order states
  - `ADMIN`: Full access — user administration, system configuration, all permissions

#### Scenario: Role seed on startup
- **WHEN** the application starts for the first time (no roles in database)
- **THEN** the system creates the four default roles and an admin user (admin@foodstore.com)

### Requirement: Role-Based Access Control
The system SHALL restrict endpoint access based on the authenticated user's role.

#### Scenario: Public endpoint access
- **WHEN** an unauthenticated request hits a public endpoint (e.g., login, register, product list)
- **THEN** the request is processed without authentication

#### Scenario: Authenticated endpoint access
- **WHEN** an authenticated request hits an endpoint with required role `CLIENTE`
- **THEN** the request is processed if the user has `CLIENTE` or higher role

#### Scenario: Insufficient role
- **WHEN** an authenticated user with role `CLIENTE` hits an endpoint requiring `GESTOR`
- **THEN** the system returns HTTP 403 Forbidden with RFC 7807 format

#### Scenario: Admin bypass
- **WHEN** an authenticated user with role `ADMIN` hits any protected endpoint
- **THEN** the request is processed regardless of the required role

### Requirement: Current User Information
The system SHALL provide an endpoint for authenticated users to retrieve their own profile and role information.

#### Scenario: Get current user
- **WHEN** an authenticated user sends GET to `/api/v1/auth/me`
- **THEN** the system returns HTTP 200 with user data including id, email, first_name, last_name, role, is_active, created_at

#### Scenario: Unauthenticated access to /me
- **WHEN** an unauthenticated request hits `/api/v1/auth/me`
- **THEN** the system returns HTTP 401 Unauthorized
