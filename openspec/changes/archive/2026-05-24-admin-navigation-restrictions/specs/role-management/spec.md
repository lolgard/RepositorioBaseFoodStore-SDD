## MODIFIED Requirements

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
- **NOTE**: This backend bypass is unchanged. Frontend navigation restrictions for ADMIN are handled separately in the frontend routing layer (see navigation-layout spec). The backend API still allows ADMIN access to all endpoints.
