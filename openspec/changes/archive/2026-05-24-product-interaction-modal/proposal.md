# Proposal: Product Detail Modal

## Why
Currently, clicking a product navigates to a dedicated page. This disrupts the shopping experience by forcing the user to leave the catalog view. An interactive modal allows users to view full product details, leave reviews, and add items to the cart without losing their browsing context.

## What Changes
- Create a reusable `ProductModal` component.
- Update `CatalogPage` to open `ProductModal` on product click instead of navigating.
- Implement "Add to cart" functionality inside the modal.
- Implement "Leave review" functionality inside the modal.
- Remove navigation to `ProductDetailPage`.

## Impact
- **Specs**: Update navigation and product interaction specs.
- **Code**: Removal of `ProductDetailPage` and associated routing.
- **UX**: Improved browsing flow and faster interaction.
