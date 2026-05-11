## Context

Ingredients are a new domain in Food Store. The backend currently has auth and category models. We need to add ingredient management with allergen tracking. The frontend already has navigation infrastructure (role-based nav, RoleProtectedRoute, toast notifications) which this change will leverage for ingredient management pages.

This is a straightforward CRUD domain — no complex hierarchy or state machine. The main design considerations are allergen filtering and soft delete.

## Goals / Non-Goals

**Goals:**
- Ingredient SQLModel with es_alergeno flag
- Full CRUD with role protection (STAFF/ADMIN for mutations, public not needed — ingredients are managed internally)
- Soft delete with validation (check no active products reference this ingredient before delete — defer to product-catalog change)
- Filtered list: by es_alergeno, search by name (ILIKE)
- Alembic migration for the ingredient table
- Frontend: ingredient list with allergen filter, create/edit form, delete with confirmation
- Empty state handling (no ingredients → meaningful message)

**Non-Goals:**
- Bulk ingredient operations (import/export)
- Ingredient-to-product association (handled in product-catalog change)
- Multi-language ingredient names
- Category-level grouping for ingredients

## Decisions

### D1: Simple flat table, no hierarchy
Ingredients have no hierarchy — it's a flat list with name and es_alergeno flag.

**Why not hierarchical?** Ingredients don't need sub-categorization at this scale. A flat table is simpler and performs well.

### D2: ILIKE for name search
Use PostgreSQL `ILIKE` for case-insensitive name search instead of full-text search.

**Why not full-text search (tsvector)?** Overkill for simple name matching with < 500 ingredients. ILIKE with an index on `name` is sufficient.

### D3: Soft delete without cascade check (deferred)
Unlike categories, ingredient soft delete won't check for active product references in this change. The product-catalog change will add that validation.

**Why defer?** Products don't exist yet. Adding the check now would require mocking a relationship to a non-existent table. The product-catalog change will add `ProductoIngrediente` and validate ingredient references.

### D4: Frontend list with filter bar
A single list page with a toggle to filter by allergens and a search input for name.

**Why not separate pages?** Ingredients are simple enough that a single list with filters provides better UX than navigating between multiple views.

## Risks / Trade-offs

- **[Risk] Duplicate ingredient names**: Two staff members could create "Harina de trigo" and "Harina de Trigo". → **Mitigation**: Unique constraint on name (case-insensitive via unique index on LOWER(name)).
- **[Trade-off] No bulk import**: Staff may need to add many ingredients at once. → Acceptable for MVP. Manual entry works for < 50 ingredients.
