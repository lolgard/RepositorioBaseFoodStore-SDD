## ADDED Requirements

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
