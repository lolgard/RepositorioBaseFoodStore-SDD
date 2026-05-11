## Context

Products are the core entity of Food Store. They sit at the intersection of categories (organization), ingredients (composition), and orders (commerce). This change adds the product domain with two junction tables for M2M relationships.

The backend already has working patterns: SQLModel with soft delete, BaseRepository pattern, service layer, role-protected routers with `require_role` dependency, and rate limiting. The frontend has RoleProtectedRoute, navigation config, and toast system.

## Goals / Non-Goals

**Goals:**
- Product SQLModel with price (NUMERIC), stock, available flag
- M2M association to categories via `ProductCategory` junction table
- M2M association to ingredients via `ProductIngredient` junction table
- Public listing with filters: by category, by ingredient, by price range, by availability, search by name (ILIKE)
- Product detail endpoint returning all associations
- Role-protected CRUD (STAFF/ADMIN) with rate limiting
- Soft delete with cascade validation (fail if category has products, defer ingredient cascade check)
- Alembic migration for all three tables
- Frontend: product list with filters, create/edit form with category/ingredient selectors
- Stock management via update endpoint

**Non-Goals:**
- Product image upload (will be separate change)
- Product variants (sizes, colors — not needed for food)
- Discount/promotion pricing
- Reviews and ratings
- Stock history / audit trail

## Decisions

### D1: Junction tables for M2M
Use explicit junction tables (`ProductCategory`, `ProductIngredient`) instead of JSON arrays or ARRAY columns.

**Why?** Normalized schema allows foreign key constraints, efficient queries (filter products by category_id or ingredient_id), and easy maintenance.

### D2: Price as DECIMAL/NUMERIC
Use SQL NUMERIC(10,2) for price instead of integer cents or float.

**Why?** NUMERIC is exact (no float rounding), supports monetary operations, and is standard SQL. Frontend receives it as string and formats with 2 decimals.

### D3: Stock as simple integer
Stock is a plain integer column on Product, decremented on order confirmation via the order-state-machine change.

**Why?** For MVP, stock is a simple counter. The order-state-machine change will add atomic decrement/increment. No separate stock movement table yet.

### D4: Available flag as boolean
Products have an `available` boolean for quick enable/disable without soft delete.

**Why?** Soft delete is permanent hiding. The available flag lets staff temporarily hide a product (e.g., out of season, temporarily unavailable). In stock = 0 automatically makes it unavailable.

### D5: Aggregate fields for API response
Product response includes `category_ids: int[]` and `ingredient_ids: int[]` from the junction tables, fetched via joins.

**Why?** Frontend needs the full list of associated IDs for the form. Returning them in the response avoids N+1 queries.

## Data Model

### Product (table: `product`)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, autoincrement |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| price | NUMERIC(10,2) | NOT NULL |
| stock | INTEGER | NOT NULL, DEFAULT 0 |
| available | BOOLEAN | NOT NULL, DEFAULT true |
| image_url | VARCHAR(500) | NULLABLE (for future use) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULLABLE |

### ProductCategory (junction)
| Column | Type | Constraints |
|--------|------|-------------|
| product_id | INTEGER | PK, FK → product.id |
| category_id | INTEGER | PK, FK → category.id |

### ProductIngredient (junction)
| Column | Type | Constraints |
|--------|------|-------------|
| product_id | INTEGER | PK, FK → product.id |
| ingredient_id | INTEGER | PK, FK → ingredient.id |

## Risks / Trade-offs

- **[Risk] Large payloads**: Products with many categories + ingredients could return large responses. → **Mitigation**: Paginate list endpoints, limit page size to 50.
- **[Trade-off] No image support yet**: Product images deferred. → Acceptable for MVP. `image_url` column is reserved.
- **[Trade-off] No stock history**: Stock changes are not logged. → Acceptable for MVP. Order-state-machine will handle stock decrements atomically.
