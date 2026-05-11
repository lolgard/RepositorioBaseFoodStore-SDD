## Why

The product catalog is the heart of Food Store. Customers need to browse products by category, see details including price, description, and allergen information, and know real-time stock availability. Staff need to manage the product catalog: add/edit products, organize them in categories, associate ingredients, and control stock.

This change establishes the complete product catalog with category associations, ingredient tracking, stock management, and public listing with filters.

## What Changes

- **Backend: Product model and DB migration** — New SQLModel `Product` with name, description, price (NUMERIC), stock, available flag, timestamps, and soft delete. Junction table `ProductCategory` for M2M category association. Junction table `ProductIngredient` for M2M ingredient association.
- **Backend: Product repository** — CRUD plus filtered queries (by category, by ingredient, by price range, search by name, by available/stock status).
- **Backend: Product service** — Business logic for product CRUD, stock updates, category/ingredient association management.
- **Backend: Product API endpoints** — Public (authenticated): `GET /api/v1/products` (list with filters), `GET /api/v1/products/{id}` (detail with categories and ingredients). Role-protected (STAFF/ADMIN): `POST`, `PUT`, `DELETE`.
- **Backend: Category → ingredient validation** — When associating ingredients to products, validate ingredient exists. When deleting a category, check no products reference it (soft delete fails if referenced).
- **Frontend: Product management pages** — List with filters (category, search, price range, available toggle), create/edit form with category selector, ingredient multi-select, stock management.
- **Frontend: Product public view** — Product detail card with categories, ingredients list (allergen-highlighted), and stock badge.

## Capabilities

### New Capabilities
- `product-catalog`: Full CRUD for products with price (NUMERIC), stock, availability toggle, M2M category association via `ProductCategory`, M2M ingredient association via `ProductIngredient`, public filtered listing, detail with all associations, stock updates, and frontend management UI.

### Modified Capabilities
- `category-management`: Soft delete validation now checks for active product references.
- `ingredient-management`: Ingredient list is used in product creation form.

## Impact

- `backend/app/models/product.py` — NEW: Product SQLModel, ProductCategory junction, ProductIngredient junction
- `backend/app/schemas/product.py` — NEW: Pydantic schemas
- `backend/app/repositories/product_repository.py` — NEW: CRUD + filtered queries
- `backend/app/services/product_service.py` — NEW: Business logic
- `backend/app/routers/products.py` — NEW: REST endpoints
- `backend/app/routers/__init__.py` — MODIFIED: Register product_router
- `backend/app/models/__init__.py` — MODIFIED: Export new models
- `backend/alembic/versions/` — NEW: Migration for product, product_category, product_ingredient tables
- `backend/tests/test_products.py` — NEW: Tests for product endpoints
- `frontend/src/entities/product/` — NEW: Product types
- `frontend/src/shared/api/product-api.ts` — NEW: API functions
- `frontend/src/pages/products/` — NEW: Product list + form + detail pages
- `frontend/src/app/router.tsx` — MODIFIED: Add product routes
- `frontend/src/shared/config/navigation.ts` — MODIFIED: Add "Products" link for STAFF/ADMIN
