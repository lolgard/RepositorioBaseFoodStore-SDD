## 1. Backend — Models and Migration

- [x] 1.1 Create `backend/app/models/product.py` with Product SQLModel (name, description, price NUMERIC(10,2), stock, available, image_url, timestamps, soft delete), ProductCategory junction (product_id, category_id), and ProductIngredient junction (product_id, ingredient_id)
- [x] 1.2 Export new models in `backend/app/models/__init__.py`
- [x] 1.3 Generate Alembic migration for product, product_category, and product_ingredient tables

## 2. Backend — Schemas

- [x] 2.1 Create `backend/app/schemas/product.py` with ProductCreate, ProductUpdate, ProductResponse (with category_ids, ingredient_ids), ProductListResponse

## 3. Backend — Repository

- [x] 3.1 Create `backend/app/repositories/product_repository.py` extending BaseRepository
- [x] 3.2 Implement create/get_by_id/list_all with joins for categories and ingredients
- [x] 3.3 Implement filtered list: by category_id, by ingredient_id, by price range (min/max), search by name (ILIKE), by available flag, by min stock
- [x] 3.4 Implement update with M2M association sync (replace categories/ingredients)
- [x] 3.5 Implement soft_delete, count methods

## 4. Backend — Service

- [x] 4.1 Create `backend/app/services/product_service.py` with CRUD logic
- [x] 4.2 Implement duplicate name validation, category existence validation, ingredient existence validation
- [x] 4.3 Implement stock update method
- [x] 4.4 Implement soft delete with category reference check (fail if product references exist for categories)

## 5. Backend — API Endpoints

- [x] 5.1 Create `backend/app/routers/products.py` with public GET endpoints: list (filtered + paginated) and detail
- [x] 5.2 Add role-protected POST, PUT, DELETE (STAFF/ADMIN) with rate limiting
- [x] 5.3 Register product_router in `backend/app/routers/__init__.py`
- [x] 5.4 Register product_router in `backend/app/main.py`

## 6. Backend — Tests

- [x] 6.1 Write tests for product creation with categories and ingredients
- [x] 6.2 Write tests for list endpoint: all, filter by category, search by name, filter by available
- [x] 6.3 Write tests for update: name change, category/ingredient sync
- [x] 6.4 Write tests for soft delete, 404, 409 for duplicates

## 7. Frontend — Entities and API

- [x] 7.1 Create `frontend/src/entities/product/types.ts` with Product, ProductCreate, ProductUpdate, ProductListResponse interfaces
- [x] 7.2 Create `frontend/src/shared/api/product-api.ts` with list, getById, create, update, remove functions

## 8. Frontend — Pages and Components

- [x] 8.1 Create product list page with filters: category dropdown, search input, available toggle, price range
- [x] 8.2 Create product form page with name, description, price, stock, available toggle, category multi-select, ingredient multi-select with allergen indicator
- [x] 8.3 Create product detail view with category badges, ingredient list (allergen-highlighted), stock status
- [x] 8.4 Integrate product routes into router with RoleProtectedRoute for STAFF
- [x] 8.5 Add "Products" nav item for STAFF/ADMIN roles in navigation config

## 9. Verification

- [x] 9.1 Run backend tests: `cd backend && pytest tests/ -v`
- [x] 9.2 Verify frontend compiles: `cd frontend && npx tsc --noEmit`
