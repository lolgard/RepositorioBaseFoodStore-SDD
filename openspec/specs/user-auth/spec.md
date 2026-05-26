# User Auth

## Purpose
Define user authentication, registration, and session management logic.
## Requirements
### Requirement: User Registration
The system SHALL allow new customers to register with email, password, first name, last name, and optional phone number.

#### Scenario: Successful registration
- **WHEN** a POST request is sent to `/api/v1/auth/register` with valid email, password (min 8 chars), first_name, last_name
- **THEN** the system returns HTTP 201 with the created user data (excluding password hash) and a success message

#### Scenario: Duplicate email registration
- **WHEN** a POST request is sent to `/api/v1/auth/register` with an email that already exists
- **THEN** the system returns HTTP 409 Conflict with RFC 7807 format indicating the email is already registered

#### Scenario: Weak password
- **WHEN** a POST request is sent with a password shorter than 8 characters
- **THEN** the system returns HTTP 422 with validation error indicating minimum password length

#### Scenario: Invalid email format
- **WHEN** a POST request is sent with an invalid email format
- **THEN** the system returns HTTP 422 with validation error

#### Scenario: Rate limit exceeded on register
- **WHEN** more than 3 registration attempts from the same IP within 60 minutes
- **THEN** the system returns HTTP 429 with RFC 7807 format and Retry-After header

### Requirement: User Login
The system SHALL authenticate users with email and password, returning JWT access and refresh tokens.

#### Scenario: Successful login
- **WHEN** a POST request is sent to `/api/v1/auth/login` with valid email and password
- **THEN** the system returns HTTP 200 with `access_token` (JWT, 15 min expiry), `refresh_token` (opaque token, 7 days), `token_type: "bearer"`, and user data

#### Scenario: Invalid credentials
- **WHEN** a POST request is sent with incorrect email or password
- **THEN** the system returns HTTP 401 Unauthorized with RFC 7807 format (without revealing whether email or password was wrong)

#### Scenario: Inactive user login
- **WHEN** a disabled/inactive user tries to login
- **THEN** the system returns HTTP 403 Forbidden with RFC 7807 format indicating the account is disabled

#### Scenario: Rate limit exceeded on login
- **WHEN** more than 5 login attempts from the same IP within 15 minutes
- **THEN** the system returns HTTP 429 with RFC 7807 format and Retry-After header

### Requirement: Token Refresh with Rotation
The system SHALL allow refreshing an expired access token using a valid refresh token, with rotation to prevent replay attacks.

#### Scenario: Successful token refresh
- **WHEN** a POST request is sent to `/api/v1/auth/refresh` with a valid `refresh_token`
- **THEN** the system returns HTTP 200 with a new `access_token`, a new `refresh_token`, and invalidates the previous refresh token

#### Scenario: Reused refresh token (theft detection)
- **WHEN** a previously used (already rotated) refresh token is sent to `/api/v1/auth/refresh`
- **THEN** the system returns HTTP 401 and invalidates ALL refresh tokens for that user (theft mitigation)

#### Scenario: Expired or invalid refresh token
- **WHEN** a POST request is sent with an expired or non-existent refresh token
- **THEN** the system returns HTTP 401 Unauthorized with RFC 7807 format

### Requirement: User Logout
The system SHALL allow authenticated users to logout, invalidating their refresh token.

#### Scenario: Successful logout
- **WHEN** an authenticated user sends a POST request to `/api/v1/auth/logout` with a valid `refresh_token`
- **THEN** the system returns HTTP 200 and invalidates the specified refresh token

#### Scenario: Logout without token
- **WHEN** an authenticated user sends a POST request to `/api/v1/auth/logout` without a refresh token
- **THEN** the system returns HTTP 200 (idempotent – no token to invalidate is acceptable)

### Requirement: Token-Bearing Request Authentication
The system SHALL authenticate requests that include a valid JWT access token in the Authorization header.

#### Scenario: Valid token request
- **WHEN** a request includes `Authorization: Bearer <valid_access_token>`
- **THEN** the system extracts the user identity and makes it available to the endpoint handler

#### Scenario: Missing or invalid token
- **WHEN** a request has no Authorization header or an invalid/expired token
- **THEN** the system returns HTTP 401 Unauthorized with RFC 7807 format

#### Scenario: Token with wrong signature
- **WHEN** a request includes a JWT signed with a different secret key
- **THEN** the system returns HTTP 401 Unauthorized

### Requirement: Checkout requires authentication
The system SHALL require users to be authenticated before they can complete a purchase (checkout). Unauthenticated users attempting to checkout SHALL be redirected to the login page.

#### Scenario: Authenticated user checkout
- **WHEN** an authenticated user with role `CLIENTE` clicks "Finalizar Compra" in the cart
- **THEN** the system SHALL open the checkout modal with address selection and payment options

#### Scenario: Unauthenticated user attempts checkout
- **WHEN** an unauthenticated user clicks "Finalizar Compra" in the cart
- **THEN** the system SHALL redirect to `/login?redirect=/cart`
- **THEN** after successful login, the system SHALL redirect back to `/cart`

#### Scenario: Staff/Admin user cannot checkout
- **WHEN** an authenticated user with role `STAFF`, `GESTOR`, or `ADMIN` clicks "Finalizar Compra"
- **THEN** the system SHALL show a message indicating that the account type cannot make purchases (existing behavior)

