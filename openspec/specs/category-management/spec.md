## ADDED Requirements

### Requirement: Category Model
The system SHALL store categories in a self-referencing table supporting hierarchical parent-child relationships.

#### Scenario: Category table structure
- **WHEN** the system creates the category table
- **THEN** it SHALL have fields: id (PK), name (required, max 100), description (optional), image_url (optional), parent_id (nullable FK to self), sort_order (default 0), is_active (default true), created_at, updated_at, deleted_at (soft delete)

#### Scenario: Root category
- **WHEN** a category has parent_id = NULL
- **THEN** it SHALL be considered a root/top-level category

#### Scenario: Child category
- **WHEN** a category has a non-null parent_id
- **THEN** it SHALL be a child of the specified parent category

### Requirement: Category CRUD — Create
The system SHALL allow STAFF and ADMIN users to create categories.

#### Scenario: Create root category
- **WHEN** a STAFF or ADMIN sends POST to `/api/v1/categories` with name and optional fields
- **THEN** the system returns HTTP 201 with the created category

#### Scenario: Create child category
- **WHEN** a STAFF or ADMIN sends POST with a valid parent_id
- **THEN** the system returns HTTP 201 and the new category is a child of the specified parent

#### Scenario: Create with invalid parent
- **WHEN** a STAFF or ADMIN sends POST with a non-existent parent_id
- **THEN** the system returns HTTP 404 with RFC 7807 format

#### Scenario: Unauthorized create
- **WHEN** a CLIENTE or unauthenticated user sends POST to create a category
- **THEN** the system returns HTTP 403 Forbidden

### Requirement: Category CRUD — Read
The system SHALL provide public read access to active categories and tree browsing.

#### Scenario: Get category tree
- **WHEN** any user (including unauthenticated) sends GET to `/api/v1/categories`
- **THEN** the system returns HTTP 200 with the full category tree as nested JSON, including only active (is_active=true) and non-deleted categories

#### Scenario: Get single category
- **WHEN** any user sends GET to `/api/v1/categories/{id}`
- **THEN** the system returns HTTP 200 with the category including its direct children (active only)

#### Scenario: Get non-existent category
- **WHEN** any user sends GET to `/api/v1/categories/{id}` with a non-existent or deleted id
- **THEN** the system returns HTTP 404 with RFC 7807 format

### Requirement: Category CRUD — Update
The system SHALL allow STAFF and ADMIN users to update categories.

#### Scenario: Update category name
- **WHEN** a STAFF or ADMIN sends PUT to `/api/v1/categories/{id}` with a new name
- **THEN** the system returns HTTP 200 with the updated category

#### Scenario: Change parent
- **WHEN** a STAFF or ADMIN sends PUT with a new parent_id
- **THEN** the system updates the category's parent

#### Scenario: Circular reference prevented
- **WHEN** a STAFF or ADMIN sends PUT with a parent_id that would create a circular reference (a child becoming its own ancestor)
- **THEN** the system returns HTTP 422 with RFC 7807 format

### Requirement: Category CRUD — Delete (Soft)
The system SHALL soft-delete categories, preventing deletion of categories that have active children.

#### Scenario: Soft delete category
- **WHEN** a STAFF or ADMIN sends DELETE to `/api/v1/categories/{id}`
- **THEN** the system sets `deleted_at` on the category (soft delete) and returns HTTP 204

#### Scenario: Delete with active children prevented
- **WHEN** a STAFF or ADMIN sends DELETE for a category that has active (non-deleted) children
- **THEN** the system returns HTTP 409 with RFC 7807 format indicating children must be removed first

### Requirement: Category Tree Query (Recursive CTE)
The system SHALL use recursive Common Table Expressions (CTEs) to efficiently query the category hierarchy.

#### Scenario: Tree includes all levels
- **WHEN** the tree endpoint is called
- **THEN** the system returns nested children at ALL depth levels, not just direct children

#### Scenario: Soft-deleted filtered out
- **WHEN** the tree is queried
- **THEN** categories with `deleted_at` set SHALL be excluded from the tree
