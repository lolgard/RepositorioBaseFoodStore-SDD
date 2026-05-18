# Proposal: Real-Time Notifications

## Why
Currently, users only get feedback on order status changes when they manually refresh or navigate. This causes delays in operational awareness and customer satisfaction.

## What Changes
- Implement WebSocket server in backend.
- Create notification service for event-driven updates.
- Update frontend to handle incoming WebSocket messages and show toasts.

## Impact
- Requires backend WebSocket connection.
- Adds dependency on notification service for order state changes.
