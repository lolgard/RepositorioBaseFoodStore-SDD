# admin-redirect-dashboard Specification

## Purpose
TBD - created by archiving change admin-navigation-restrictions. Update Purpose after archive.
## Requirements
### Requirement: Admin default redirect to Dashboard
The system SHALL redirect ADMIN users to the Dashboard (`/admin/metrics`) after login and when accessing the root path `/`.

#### Scenario: Admin login redirect
- **WHEN** a user with role `ADMIN` completes the login process
- **THEN** the system SHALL redirect to `/admin/metrics`

#### Scenario: Admin accesses root path
- **WHEN** an authenticated user with role `ADMIN` navigates to `/`
- **THEN** the system SHALL redirect to `/admin/metrics` instead of showing the HomePage

#### Scenario: Non-admin login redirect
- **WHEN** a user with role `CLIENTE`, `STAFF`, or `GESTOR` completes the login process
- **THEN** the system SHALL redirect to `/products` (catalog)

#### Scenario: Admin navigates to profile
- **WHEN** an authenticated user with role `ADMIN` navigates to `/profile`
- **THEN** the system SHALL show the profile page normally (ADMIN still has profile access)

