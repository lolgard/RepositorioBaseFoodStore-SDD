## Why

Categories are the organizational backbone of the product catalog. Without a category hierarchy, products can't be grouped, customers can't browse by department, and staff can't organize inventory. This change establishes the complete category management system with hierarchical support (parent-child relationships via self-referencing table), soft delete with validation, and a public tree endpoint for the catalog.

## What Changes

- **Backend: Category model and DB migration** — New SQLModel `Category` with self-referencing parent_id, name, description, image URL, is_active flag, and soft delete fields. Alembic migration to create the `category` table with proper foreign key constraint.
- **Backend: Category repository** — CRUD operations plus recursive CTE query for fetching the full category tree, and validation queries (detect children before delete, detect circular references).
- **Backend: Category service** — Business logic for tree management, soft delete with children validation (prevents deleting categories that have active children), hierarchical CRUD.
- **Backend: Category API endpoints** — `GET /api/v1/categories` (public tree), `GET /api/v1/categories/{id}` (single with children), `POST /api/v1/categories` (STAFF/ADMIN), `PUT /api/v1/categories/{id}` (STAFF/ADMIN), `DELETE /api/v1/categories/{id}` (soft delete, STAFF/ADMIN).
- **Backend: Role protection** — All mutating endpoints require STAFF or ADMIN role (via `RoleProtectedRoute` equivalent on the backend `require_role` dependency).
- **Frontend: Category management pages** — List view with tree display, create/edit form with parent selector, delete with confirmation and children warning.
- **Frontend: Public category display** — Tree component for browsing categories in the catalog.

## Capabilities

### New Capabilities
- `category-management`: Hierarchical category CRUD with self-referencing parent_id, recursive CTE tree queries, soft delete with children validation, role-protected management endpoints (STAFF/ADMIN), public tree endpoint, and frontend management UI.

### Modified Capabilities

None — this is a new domain with no existing capability overlap.

## Impact

- `backend/app/models/category.py` — NEW: Category SQLModel with parent_id FK to self
- `backend/app/schemas/category.py` — NEW: Pydantic schemas (CategoryCreate, CategoryUpdate, CategoryResponse, CategoryTree)
- `backend/app/repositories/category_repository.py` — NEW: CRUD + recursive CTE tree query + validation
- `backend/app/services/category_service.py` — NEW: Business logic for hierarchy management
- `backend/app/routers/categories.py` — NEW: REST endpoints with role protection
- `backend/app/routers/__init__.py` — MODIFIED: Register category_router
- `backend/alembic/versions/` — NEW: Migration for category table
- `frontend/src/entities/category/` — NEW: Category types
- `frontend/src/shared/api/category-api.ts` — NEW: API functions
- `frontend/src/pages/categories/` — NEW: Category list + form pages
- `frontend/src/widgets/categories/` — NEW: Category tree component
- `frontend/src/app/router.tsx` — MODIFIED: Add category routes (RoleProtectedRoute for STAFF)
- `frontend/src/shared/config/navigation.ts` — MODIFIED: Add "Categories" link for STAFF/ADMIN (already exists in config from navigation-layout)
