"""
Service to validate cart items before checkout.
Read-only: checks stock, availability, and price changes.
"""
from decimal import Decimal
from app.core.exceptions import NotFoundError
from app.repositories.product_repository import ProductRepository
from app.schemas.checkout import CheckoutItem, CheckoutIssue


class CheckoutValidationService:
    """Validates cart items without modifying any data."""

    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    async def validate(self, items: list[CheckoutItem]) -> tuple[bool, list[CheckoutIssue]]:
        """
        Validate cart items. Returns (is_valid, list_of_issues).
        Checks: product exists, is available, stock sufficient, price unchanged.
        """
        issues: list[CheckoutIssue] = []

        for item in items:
            product = await self.product_repo.get_by_id(item.product_id)

            # Check product exists
            if not product:
                issues.append(CheckoutIssue(
                    type="product_not_found",
                    product_id=item.product_id,
                    product_name=f"Product #{item.product_id}",
                    message=f"Product #{item.product_id} not found or has been deleted",
                ))
                continue

            # Check product is available
            if not product.available:
                issues.append(CheckoutIssue(
                    type="product_unavailable",
                    product_id=product.id,
                    product_name=product.name,
                    message=f"Product '{product.name}' is no longer available",
                ))
                continue

            # Check stock
            if product.stock < item.quantity:
                issues.append(CheckoutIssue(
                    type="stock_changed",
                    product_id=product.id,
                    product_name=product.name,
                    message=f"Insufficient stock for '{product.name}': requested {item.quantity}, available {product.stock}",
                    requested=item.quantity,
                    available=product.stock,
                ))

            # Check price
            if item.expected_price is not None:
                expected = Decimal(str(item.expected_price))
                current = Decimal(str(product.price))
                if expected != current:
                    issues.append(CheckoutIssue(
                        type="price_changed",
                        product_id=product.id,
                        product_name=product.name,
                        message=f"Price changed for '{product.name}': was ${expected:.2f}, now ${current:.2f}",
                        expected_price=str(expected),
                        current_price=str(current),
                    ))

        return len(issues) == 0, issues
