## ADDED Requirements

### Requirement: Discount Coupon
WHEN an authenticated user applies a coupon code during checkout,
the system SHALL validate the coupon and apply the discount to the order.

#### Scenario: Valid Coupon
GIVEN a coupon code "SAVE10" exists and is active
WHEN the user applies "SAVE10"
THEN the order total is reduced by the specified discount.
