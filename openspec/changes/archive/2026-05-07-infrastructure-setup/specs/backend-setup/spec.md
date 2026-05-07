## ADDED Requirements

### Requirement: FastAPI App Initialization
The system SHALL provide a FastAPI application instance configured with ASGI support, CORS middleware, and RFC 7807 error handlers.

#### Scenario: Successful app creation
- **WHEN** the backend starts
- **THEN** the FastAPI app is created with title "Food Store API", version "1.0.0", and OpenAPI docs enabled

#### Scenario: CORS middleware enabled
- **WHEN** a request comes from an allowed origin
- **THEN** the request is processed without CORS errors

### Requirement: SQLModel ORM Setup
The system SHALL use SQLModel as the ORM, combining SQLAlchemy and Pydantic v2 for unified model definitions.

#### Scenario: Database connection established
- **WHEN** the application starts
- **THEN** a SQLModel engine is created using the DATABASE_URL environment variable

#### Scenario: Session management
- **WHEN** a request requires database access
- **THEN** a SQLModel session is provided via dependency injection

### Requirement: Alembic Migrations
The system SHALL use Alembic to manage database schema migrations linked to SQLModel definitions.

#### Scenario: Generate migration
- **WHEN** a developer runs `alembic revision --autogenerate -m "description"`
- **THEN** a new migration script is created in `alembic/versions/` reflecting model changes

#### Scenario: Apply migrations
- **WHEN** the application starts (or `alembic upgrade head` runs)
- **THEN** all pending migrations are applied to the PostgreSQL database

### Requirement: BaseRepository[T] Generic
The system SHALL provide a generic `BaseRepository[T]` class parameterized with a SQLModel type for common CRUD operations.

#### Scenario: Get by ID
- **WHEN** `get_by_id(id)` is called with a valid ID
- **THEN** the entity with that ID is returned, or None if not found (excluding soft-deleted)

#### Scenario: List all with pagination
- **WHEN** `list_all(skip=0, limit=10)` is called
- **THEN** a list of up to 10 entities is returned, excluding soft-deleted

#### Scenario: Create entity
- **WHEN** `create(obj)` is called with a valid SQLModel instance
- **THEN** the object is added to session, flushed (to get ID), and the instance with ID is returned

#### Scenario: Update entity
- **WHEN** `update(id, data)` is called with valid ID and update fields
- **THEN** the entity is updated, flushed, and the updated instance is returned

#### Scenario: Soft delete
- **WHEN** `soft_delete(id)` is called with a valid ID
- **THEN** the entity's `eliminado_en` field is set to current timestamp (hard delete NOT used)

### Requirement: UnitOfWork Context Manager
The system SHALL provide a `UnitOfWork` async context manager that encapsulates a SQLModel session and exposes repositories.

#### Scenario: Successful transaction
- **WHEN** operations are performed inside `async with UnitOfWork() as uow:`
- **THEN** all operations are committed when exiting the block successfully

#### Scenario: Rollback on error
- **WHEN** an exception occurs inside `async with UnitOfWork() as uow:`
- **THEN** all operations are rolled back and the session is closed

#### Scenario: Repository access
- **WHEN** inside a UnitOfWork block
- **THEN** repositories are accessible as attributes (e.g., `uow.productos`, `uow.usuarios`)

### Requirement: Pydantic v2 Schemas
The system SHALL use Pydantic v2 for request/response validation with three schema variants: Create, Update, Read.

#### Scenario: Create schema validation
- **WHEN** a request body is validated against a Create schema
- **THEN** only fields required for creation are validated (no ID, no timestamps)

#### Scenario: Update schema validation
- **WHEN** a request body is validated against an Update schema
- **THEN** all fields are optional to allow partial updates

#### Scenario: Read schema serialization
- **WHEN** a response is serialized using a Read schema
- **THEN** sensitive fields (like password hashes) are excluded

### Requirement: Environment Configuration
The system SHALL use Pydantic Settings to manage environment variables from `.env` file.

#### Scenario: Load configuration
- **WHEN** the application starts
- **THEN** variables like DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES are loaded

#### Scenario: Missing required variable
- **WHEN** a required environment variable is missing
- **THEN** the application fails to start with a clear error message
