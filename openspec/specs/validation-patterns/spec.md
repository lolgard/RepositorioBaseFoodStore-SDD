# Validation Patterns

## Requirements

### Requirement: Pydantic v2 Request Schema Validation
The system SHALL use Pydantic v2 schemas to validate all incoming request bodies and query parameters.

#### Scenario: Valid request body
- **WHEN** a POST request is sent with valid fields matching the Request schema
- **THEN** the endpoint handler receives a validated Pydantic object

#### Scenario: Invalid request body
- **WHEN** a POST request contains invalid data (e.g., string in numeric field)
- **THEN** the API returns HTTP 422 with detailed validation errors per field

#### Scenario: Optional fields handling
- **WHEN** a PATCH request omits optional fields in an Update schema
- **THEN** only the provided fields are validated and updated

### Requirement: Pydantic v2 Response Schema Serialization
The system SHALL use Pydantic v2 schemas to serialize all API responses consistently.

#### Scenario: Successful response serialization
- **WHEN** an endpoint returns a model instance
- **THEN** it is serialized using the Read schema, excluding sensitive fields

#### Scenario: List response with pagination metadata
- **WHEN** a list endpoint returns paginated results
- **THEN** the response includes `items`, `total`, `skip`, `limit` fields

### Requirement: Custom Pydantic Validators
The system SHALL support custom validators (decorators) for complex field validation.

#### Scenario: Email format validation
- **WHEN** a schema includes an email field with `EmailStr` or custom validator
- **THEN** invalid email formats are rejected with HTTP 422

#### Scenario: Password complexity validation
- **WHEN** a RegisterRequest includes a password
- **THEN** it is validated for minimum length (8 chars) and complexity requirements

### Requirement: Query Parameter Validation
The system SHALL validate query parameters using Pydantic models with `Query` parameters.

#### Scenario: Valid pagination params
- **WHEN** a GET request includes `?skip=0&limit=10`
- **THEN** the parameters are validated as integers with appropriate defaults

#### Scenario: Invalid query params
- **WHEN** a GET request includes `?skip=abc`
- **THEN** the API returns HTTP 422 indicating the parameter must be an integer
