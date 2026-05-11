## Why

Ingredients are fundamental to the product catalog. Customers need to know what's in each product — especially which allergens are present — to make informed purchase decisions. Staff need to manage the ingredient list, mark allergens, and associate ingredients with products. This change establishes the complete ingredient management system with allergen flags, filtering, and soft delete.

## What Changes

- **Backend: Ingredient model and DB migration** — New SQLModel `Ingredient` with id, name, es_alergeno flag, and soft delete fields. Alembic migration to create the `ingredient` table.
- **Backend: Ingredient repository** — CRUD operations plus filtered queries (by allergen, search by name).
- **Backend: Ingredient service** — Business logic for ingredient CRUD with soft delete validation.
- **Backend: Ingredient API endpoints** — `GET /api/v1/ingredients` (list with filters), `GET /api/v1/ingredients/{id}` (single), `POST /api/v1/ingredients` (STAFF/ADMIN), `PUT /api/v1/ingredients/{id}` (STAFF/ADMIN), `DELETE /api/v1/ingredients/{id}` (soft delete, STAFF/ADMIN).
- **Backend: Role protection** — All mutating endpoints require STAFF or ADMIN role via `require_role` dependency.
- **Frontend: Ingredient management pages** — List view with allergen filter, create/edit form with allergen toggle, delete with confirmation.
- **Frontend: Navigation update** — Add "Ingredients" navigation link for STAFF/ADMIN roles.

## Capabilities

### New Capabilities
- `ingredient-management`: Full CRUD for ingredients with allergen flag (es_alergeno), filtered list (by allergen status, name search), soft delete with validation, role-protected management endpoints (STAFF/ADMIN), and frontend management UI.

### Modified Capabilities
None — this is a new domain with no existing capability overlap.

## Impact

- `backend/app/models/ingredient.py` — NEW: Ingredient SQLModel
- `backend/app/schemas/ingredient.py` — NEW: Pydantic schemas (IngredientCreate, IngredientUpdate, IngredientResponse)
- `backend/app/repositories/ingredient_repository.py` — NEW: CRUD + filtered queries
- `backend/app/services/ingredient_service.py` — NEW: Business logic for ingredient management
- `backend/app/routers/ingredients.py` — NEW: REST endpoints with role protection
- `backend/app/routers/__init__.py` — MODIFIED: Register ingredient_router
- `backend/alembic/versions/` — NEW: Migration for ingredient table
- `frontend/src/entities/ingredient/` — NEW: Ingredient types
- `frontend/src/shared/api/ingredient-api.ts` — NEW: API functions
- `frontend/src/pages/ingredients/` — NEW: Ingredient list + form pages
- `frontend/src/app/router.tsx` — MODIFIED: Add ingredient routes (RoleProtectedRoute for STAFF)
- `frontend/src/shared/config/navigation.ts` — MODIFIED: Add "Ingredients" link for STAFF/ADMIN
