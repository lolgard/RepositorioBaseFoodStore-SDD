## ADDED Requirements

### Requirement: RFC 7807 Error Response Format
The system SHALL return HTTP error responses following RFC 7807 (Problem Details for HTTP APIs) format.

#### Scenario: Validation error response
- **WHEN** a request contains invalid data (e.g., invalid email format)
- **THEN** the API returns HTTP 422 with JSON body: `{"type": "https://example.com/probs/validation-error", "title": "Validation Error", "status": 422, "detail": "...", "instance": "/api/v1/auth/register"}`

#### Scenario: Not found error
- **WHEN** a request references a non-existent resource (e.g., GET /api/v1/productos/99999)
- **THEN** the API returns HTTP 404 with RFC 7807 format including resource details

#### Scenario: Unauthorized error
- **WHEN** a request lacks valid authentication
- **THEN** the API returns HTTP 401 with RFC 7807 format

#### Scenario: Forbidden error
- **WHEN** an authenticated user lacks permission for a resource
- **THEN** the API returns HTTP 403 with RFC 7807 format

### Requirement: Global Exception Handler
The system SHALL implement a global exception handler in FastAPI that catches unhandled exceptions and returns RFC 7807 responses.

#### Scenario: Unhandled server error
- **WHEN** an unexpected exception occurs during request processing
- **THEN** the API returns HTTP 500 with RFC 7807 format and logs the error internally (without exposing internals to client)

#### Scenario: Custom business logic exception
- **WHEN** a known business exception is raised (e.g., InsufficientStockError)
- **THEN** the API returns the appropriate HTTP status (e.g., 400) with RFC 7807 format and business-specific `type`

### Requirement: Rate Limiting on Sensitive Endpoints
The system SHALL implement rate limiting on authentication endpoints using slowapi.

#### Scenario: Rate limit exceeded on login
- **WHEN** more than 5 login attempts occur from the same IP within 15 minutes
- **THEN** the API returns HTTP 429 with `Retry-After` header indicating seconds to wait

#### Scenario: Successful login within limit
- **WHEN** a login attempt is made within the allowed rate
- **THEN** the request is processed normally
