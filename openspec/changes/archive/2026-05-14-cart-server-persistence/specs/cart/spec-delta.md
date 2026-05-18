## ADDED Requirements

### Requirement: Cart Server Persistence
WHEN an authenticated user adds an item to the cart,
the system SHALL persist the cart state in the backend.

### Requirement: Sync on Login
WHEN a user logs in,
the system SHALL merge the local cart with the server-side cart.

#### Scenario: Persistent Cart
GIVEN an authenticated user has items in their cart
WHEN the user logs out and logs in from a different device
THEN the cart items are restored.
