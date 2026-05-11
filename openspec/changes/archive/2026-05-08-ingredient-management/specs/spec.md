# Spec: ingredient-management

## Description
Management of product ingredients and allergen tracking. Provides CRUD operations for ingredients with the ability to mark items as allergens, search/filter the ingredient list, and soft-delete ingredients.

## Endpoints

### List Ingredients
`GET /api/v1/ingredients`

Query parameters:
- `es_alergeno` (bool, optional) — Filter by allergen status
- `search` (string, optional) — Search by name (ILIKE)
- `skip` (int, default 0) — Pagination offset
- `limit` (int, default 20) — Page size

Response: `{ items: IngredientResponse[], total: number, skip: number, limit: number }`

Auth: Public (authenticated users can list)

### Get Ingredient
`GET /api/v1/ingredients/{id}`

Response: `IngredientResponse`

Auth: Public

### Create Ingredient
`POST /api/v1/ingredients`

Body: `IngredientCreate`

Response: `IngredientResponse` (201)

Auth: STAFF, ADMIN

### Update Ingredient
`PUT /api/v1/ingredients/{id}`

Body: `IngredientUpdate`

Response: `IngredientResponse`

Auth: STAFF, ADMIN

### Delete Ingredient (soft)
`DELETE /api/v1/ingredients/{id}`

Response: 204 No Content

Auth: STAFF, ADMIN

## Schemas

### IngredientCreate
- `name` (string, required, max 100, unique)
- `description` (string, optional, max 500)
- `es_alergeno` (bool, default false)

### IngredientUpdate
- `name` (string, optional, max 100)
- `description` (string, optional, max 500)
- `es_alergeno` (bool, optional)

### IngredientResponse
- `id` (int)
- `name` (string)
- `description` (string, nullable)
- `es_alergeno` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)
- `deleted_at` (datetime, nullable)

## Data Model

### Ingredient (table: `ingredient`)
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, autoincrement |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | VARCHAR(500) | NULLABLE |
| es_alergeno | BOOLEAN | NOT NULL, DEFAULT false |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |
| deleted_at | TIMESTAMP | NULLABLE (soft delete) |

## Role Requirements
| Endpoint | Roles |
|----------|-------|
| GET /api/v1/ingredients | Public (any authenticated user) |
| GET /api/v1/ingredients/{id} | Public |
| POST /api/v1/ingredients | STAFF, ADMIN |
| PUT /api/v1/ingredients/{id} | STAFF, ADMIN |
| DELETE /api/v1/ingredients/{id} | STAFF, ADMIN |

## Error Codes
| HTTP | Condition |
|------|-----------|
| 400 | Validation error (missing fields, invalid values) |
| 401 | Not authenticated |
| 403 | Insufficient role (not STAFF/ADMIN) |
| 404 | Ingredient not found |
| 409 | Duplicate ingredient name |
