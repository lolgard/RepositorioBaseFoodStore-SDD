# Spec: product-catalog

## Description
Product catalog management with category and ingredient associations. Provides CRUD operations for products with filtered listing, stock management, and M2M relationships.

## Endpoints

### List Products
`GET /api/v1/products`

Query parameters:
- `category_id` (int, optional) — Filter by category
- `ingredient_id` (int, optional) — Filter by ingredient
- `search` (string, optional) — Search by name (ILIKE)
- `available` (bool, optional) — Filter by availability
- `min_price` (decimal, optional) — Minimum price
- `max_price` (decimal, optional) — Maximum price
- `min_stock` (int, optional) — Minimum stock level
- `skip` (int, default 0) — Pagination offset
- `limit` (int, default 20, max 50) — Page size

Response: `{ items: ProductResponse[], total: number, skip: number, limit: number }`

Auth: Public (authenticated users)

### Get Product
`GET /api/v1/products/{id}`

Response: `ProductResponse` (includes category_ids and ingredient_ids)

Auth: Public

### Create Product
`POST /api/v1/products`

Body: `ProductCreate`

Response: `ProductResponse` (201)

Auth: STAFF, ADMIN

### Update Product
`PUT /api/v1/products/{id}`

Body: `ProductUpdate`

Response: `ProductResponse`

Auth: STAFF, ADMIN

### Delete Product (soft)
`DELETE /api/v1/products/{id}`

Response: 204 No Content

Auth: STAFF, ADMIN

## Schemas

### ProductCreate
- `name` (string, required, max 200)
- `description` (string, optional)
- `price` (decimal, required, > 0)
- `stock` (int, default 0, >= 0)
- `available` (bool, default true)
- `category_ids` (int[], optional) — Categories to associate
- `ingredient_ids` (int[], optional) — Ingredients to associate

### ProductUpdate
- `name` (string, optional, max 200)
- `description` (string, optional)
- `price` (decimal, optional, > 0)
- `stock` (int, optional, >= 0)
- `available` (bool, optional)
- `category_ids` (int[], optional) — Replaces all category associations
- `ingredient_ids` (int[], optional) — Replaces all ingredient associations

### ProductResponse
- `id` (int)
- `name` (string)
- `description` (string, nullable)
- `price` (string — decimal formatted)
- `stock` (int)
- `available` (bool)
- `image_url` (string, nullable)
- `category_ids` (int[])
- `ingredient_ids` (int[])
- `created_at` (datetime)
- `updated_at` (datetime)
- `deleted_at` (datetime, nullable)

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
| image_url | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULLABLE |

### ProductCategory (junction)
| Column | Type | Constraints |
|--------|------|-------------|
| product_id | INTEGER | PK, FK → product.id ON DELETE CASCADE |
| category_id | INTEGER | PK, FK → category.id |

### ProductIngredient (junction)
| Column | Type | Constraints |
|--------|------|-------------|
| product_id | INTEGER | PK, FK → product.id ON DELETE CASCADE |
| ingredient_id | INTEGER | PK, FK → ingredient.id |

## Role Requirements
| Endpoint | Roles |
|----------|-------|
| GET /api/v1/products | Public (any authenticated user) |
| GET /api/v1/products/{id} | Public |
| POST /api/v1/products | STAFF, ADMIN |
| PUT /api/v1/products/{id} | STAFF, ADMIN |
| DELETE /api/v1/products/{id} | STAFF, ADMIN |

## Error Codes
| HTTP | Condition |
|------|-----------|
| 400 | Validation error (missing fields, invalid price/stock) |
| 401 | Not authenticated |
| 403 | Insufficient role (not STAFF/ADMIN) |
| 404 | Product, category, or ingredient not found |
| 409 | Duplicate product name |
