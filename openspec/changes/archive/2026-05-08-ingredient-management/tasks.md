## 1. Backend — Model and Migration

- [x] 1.1 Create `backend/app/models/ingredient.py` with Ingredient SQLModel: id, name, description, es_alergeno (bool, default false), created_at, updated_at, deleted_at
- [x] 1.2 Generate Alembic migration for the `ingredient` table with unique constraint on name

## 2. Backend — Repository

- [x] 2.1 Create `backend/app/repositories/ingredient_repository.py` with create, get_by_id, list_all, update, soft_delete methods
- [x] 2.2 Implement filtered queries: `list_by_allergen(es_alergeno)`, `search_by_name(name)` using ILIKE
- [x] 2.3 Implement `count_by_name(name)` for duplicate detection

## 3. Backend — Schemas and Service

- [x] 3.1 Create `backend/app/schemas/ingredient.py` with IngredientCreate, IngredientUpdate, IngredientResponse
- [x] 3.2 Create `backend/app/services/ingredient_service.py` with CRUD logic, duplicate name validation, and filtered list queries

## 4. Backend — API Endpoints

- [x] 4.1 Create `backend/app/routers/ingredients.py` with GET /api/v1/ingredients (list with ?es_alergeno=&search= filters) and GET /api/v1/ingredients/{id}
- [x] 4.2 Add role-protected POST /api/v1/ingredients (STAFF/ADMIN), PUT /api/v1/ingredients/{id} (STAFF/ADMIN), DELETE /api/v1/ingredients/{id} (STAFF/ADMIN) using require_role dependency
- [x] 4.3 Register ingredient_router in `backend/app/routers/__init__.py`

## 5. Backend — Tests

- [x] 5.1 Write tests for ingredient creation: success, duplicate name (409), unauthorized
- [x] 5.2 Write tests for list endpoint: all, filter by es_alergeno, search by name
- [x] 5.3 Write tests for soft delete: success, 404 for non-existent
- [x] 5.4 Write tests for update: success, duplicate name validation

## 6. Frontend — Entities and API

- [x] 6.1 Create `frontend/src/entities/ingredient/types.ts` with Ingredient, IngredientCreate, IngredientUpdate interfaces
- [x] 6.2 Create `frontend/src/shared/api/ingredient-api.ts` with list, getById, create, update, remove functions

## 7. Frontend — Pages and Components

- [x] 7.1 Create `frontend/src/pages/ingredients/IngredientListPage.tsx` with filter bar (allergen toggle + search input), table view, add/edit/delete actions
- [x] 7.2 Create `frontend/src/pages/ingredients/IngredientFormPage.tsx` with create/edit form including allergen toggle
- [x] 7.3 Integrate ingredient routes into router with RoleProtectedRoute for STAFF
- [x] 7.4 Add "Ingredients" nav item for STAFF/ADMIN roles in navigation config

## 8. Documentation and Verification

- [x] 8.1 Verify backend starts with new module
- [x] 8.2 Verify frontend compiles without TypeScript errors
- [x] 8.3 Run backend tests: `cd backend && pytest tests/ -v`
