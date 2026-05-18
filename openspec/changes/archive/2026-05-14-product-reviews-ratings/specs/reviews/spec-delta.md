## ADDED Requirements

### Requirement: Product Reviews
WHEN a user views a product,
the system SHALL display product reviews and ratings.

### Requirement: Submit Review
WHEN an authenticated user submits a review,
the system SHALL save the rating and comment to the product.

#### Scenario: Successful Review
GIVEN a user purchased the product
WHEN the user submits a rating of 5 and comment "Excellent"
THEN the review is saved and displayed on the product page.
