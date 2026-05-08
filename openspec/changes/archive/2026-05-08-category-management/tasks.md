## 1. Backend — Model and Migration

- [x] 1.1 Create `backend/app/models/category.py` with Category SQLModel: id, name, description, image_url, parent_id (nullable FK to self), sort_order, is_active, created_at, updated_at, deleted_at
- [x] 1.2 Generate Alembic migration for the `category` table with self-referencing FK, index on parent_id, and composite index on (deleted_at, is_active)

## 2. Backend — Repository

- [x] 2.1 Create `backend/app/repositories/category_repository.py` with create, get_by_id, list_all, update, soft_delete methods (inheriting BaseRepository patterns)
- [x] 2.2 Implement recursive CTE tree query `get_tree()` that returns all active non-deleted categories with parent_id for application-level tree assembly
- [x] 2.3 Implement `has_active_children(category_id)` to check for non-deleted children before soft delete
- [x] 2.4 Implement circular reference detection utility for parent updates

## 3. Backend — Schemas and Service

- [x] 3.1 Create `backend/app/schemas/category.py` with CategoryCreate, CategoryUpdate, CategoryResponse, CategoryTreeNode (nested children list)
- [x] 3.2 Create `backend/app/services/category_service.py` with CRUD logic, tree assembly from flat CTE results, soft delete validation, and circular reference check

## 4. Backend — API Endpoints

- [x] 4.1 Create `backend/app/routers/categories.py` with public GET /api/v1/categories (tree) and GET /api/v1/categories/{id}
- [x] 4.2 Add role-protected POST /api/v1/categories (STAFF/ADMIN), PUT /api/v1/categories/{id} (STAFF/ADMIN), DELETE /api/v1/categories/{id} (STAFF/ADMIN) using require_role dependency
- [x] 4.3 Register category_router in `backend/app/routers/__init__.py`

## 5. Backend — Tests

- [x] 5.1 Write tests for category creation: root, child, invalid parent, unauthorized
- [x] 5.2 Write tests for tree endpoint: returns nested structure, excludes inactive/deleted, empty state
- [x] 5.3 Write tests for soft delete: success, delete with active children blocked (409), delete without children succeeds
- [x] 5.4 Write tests for circular reference prevention on parent update

## 6. Frontend — Entities and API

- [x] 6.1 Create `frontend/src/entities/category/types.ts` with Category, CategoryTreeNode, CategoryCreate, CategoryUpdate interfaces
- [x] 6.2 Create `frontend/src/shared/api/category-api.ts` with getTree, getById, create, update, remove functions

## 7. Frontend — Pages and Components

- [x] 7.1 Create `frontend/src/widgets/categories/CategoryTree.tsx` recursive component for displaying hierarchical category tree with expand/collapse
- [x] 7.2 Create `frontend/src/pages/categories/CategoryListPage.tsx` with tree view, add button, edit/delete actions per node
- [x] 7.3 Create `frontend/src/pages/categories/CategoryFormPage.tsx` with create/edit form including parent selector dropdown
- [x] 7.4 Integrate category routes into router with RoleProtectedRoute for STAFF, add nav item for Categories (already exists in navigation config from navigation-layout change)
