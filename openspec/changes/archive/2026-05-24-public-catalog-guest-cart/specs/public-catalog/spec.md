## ADDED Requirements

### Requirement: Public catalog access
The system SHALL allow any user (authenticated or not) to browse the product catalog, view product details, search, and filter products.

#### Scenario: Guest browses catalog
- **WHEN** an unauthenticated user navigates to `/products`
- **THEN** the system SHALL display the product catalog with all products, filters, and search functionality

#### Scenario: Guest views product detail
- **WHEN** an unauthenticated user navigates to `/products/:id`
- **THEN** the system SHALL display the full product detail page

#### Scenario: Guest searches products
- **WHEN** an unauthenticated user types a search query in the catalog search bar
- **THEN** the system SHALL filter products by name and display matching results

#### Scenario: Guest filters by category
- **WHEN** an unauthenticated user selects a category filter in the catalog
- **THEN** the system SHALL filter products by the selected category

#### Scenario: Authenticated user browses catalog
- **WHEN** an authenticated user navigates to `/products`
- **THEN** the system SHALL display the catalog AND show management actions (edit, delete, create) if the user has STAFF or higher role

### Requirement: Root redirects to catalog
The system SHALL redirect the root path `/` to the catalog page `/products` for all users.

#### Scenario: Unauthenticated user hits root
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the system SHALL redirect to `/products`

#### Scenario: Authenticated user hits root (non-admin)
- **WHEN** an authenticated user with role `CLIENTE`, `STAFF`, or `GESTOR` navigates to `/`
- **THEN** the system SHALL redirect to `/products`

#### Scenario: Admin user hits root
- **WHEN** an authenticated user with role `ADMIN` navigates to `/`
- **THEN** the system SHALL redirect to `/admin/metrics` (Dashboard)
