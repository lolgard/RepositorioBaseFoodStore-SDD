## Context

Categories are a new domain in Food Store. The backend currently has auth-only models (User, RefreshToken). We need to add a hierarchical category system. The frontend already has the navigation-layout infrastructure (role-based nav, RoleProtectedRoute, toast notifications) which this change will leverage for category management pages.

The postgresql-table-design skill recommends using a recursive CTE for hierarchical queries rather than the nested set or materialized path pattern, since categories are relatively few (< 1000) and the tree depth is shallow (typically 2-3 levels).

## Goals / Non-Goals

**Goals:**
- Category SQLModel with self-referencing parent_id FK
- Recursive CTE for tree queries (not Nested Set — overkill for our scale)
- Full CRUD with role protection (STAFF/ADMIN for mutations, public for reads)
- Soft delete with children validation (can't delete a category that has active children)
- Circular reference detection on parent change
- Alembic migration for the category table
- Frontend: category list with tree display, create/edit form, delete with confirmation
- Frontend: public category tree component for catalog browsing
- Empty state handling (no categories → meaningful message, not an empty tree)

**Non-Goals:**
- Bulk category operations (import/export)
- Category reordering via drag-and-drop (sort_order field is manual)
- Category images upload (image_url is a string, external hosting)
- Multi-language category names
- Category-level permissions (inheritance from parent)

## Decisions

### D1: Recursive CTE over Nested Set or Materialized Path
Use PostgreSQL recursive CTE (`WITH RECURSIVE`) to query the category tree. The tree is built in Python by nesting children into their parents.

**Why not Nested Set (left/right)?** Nested Set optimizes reads at the cost of complex writes (every insert/delete renumbers all nodes). For categories with infrequent writes and shallow depth, the maintenance cost isn't worth it.

**Why not Materialized Path (path column)?** Would work, but requires maintaining path strings and adds complexity for circular reference detection.

### D2: Tree built in application layer, not in SQL
The recursive CTE returns all categories as rows with `parent_id`. The application code (in `CategoryService`) assembles the nested tree structure.

**Why not return the CTE result directly as a tree?** PostgreSQL can return nested JSON with `json_agg`, but building the tree in Python gives us more control over filtering (active/inactive), transformation, and error handling. The number of categories is small, so performance isn't a concern.

### D3: Circular reference detection via path tracking
When updating a category's parent, walk up the new parent's ancestor chain and verify the target category isn't in it. Limit walk to 10 levels to prevent infinite loops.

**Why not a trigger or constraint?** Application-level validation gives better error messages (RFC 7807). The walk is cheap with < 1000 categories.

### D4: Soft delete checks children synchronously
Before soft-deleting a category, query for active (non-deleted) children. If any exist, return 409 Conflict.

**Why not cascade?** Cascading soft deletes would silently remove legitimate data. The explicit check forces the user to reassign or delete children first.

### D5: Frontend tree component is recursive
A `CategoryTree` component renders itself recursively for children. Each node shows expand/collapse for children.

**Why not a flat list with indentation?** A recursive tree component is the standard UX pattern for hierarchies and works well with shallow depth.

## Risks / Trade-offs

- **[Risk] Deep recursion in tree building**: If a malicious user creates a deeply nested chain, Python recursion could hit the stack limit. → **Mitigation**: Limit tree depth to 10 levels. Any deeper chain is truncated at 10.
- **[Trade-off] In-memory tree assembly**: For very large category sets (>5000), assembling the tree in Python could be slow. → Acceptable because food store categories are typically < 200.
- **[Risk] Orphaned categories on parent soft delete**: If a parent is soft-deleted without checking children, children become orphaned. → **Mitigation**: Soft delete is blocked if children exist (409 Conflict).
