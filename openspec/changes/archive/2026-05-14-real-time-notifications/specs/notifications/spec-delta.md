## ADDED Requirements

### Requirement: Real-time Notifications
WHEN an order status changes,
the system SHALL send a WebSocket notification to the relevant users.

#### Scenario: Status Update
GIVEN a user is connected to the notification WebSocket
WHEN the order status changes to "READY"
THEN the user receives a notification message
AND a toast is displayed in the UI.
