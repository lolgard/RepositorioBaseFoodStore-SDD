"""
Category repository extending BaseRepository with hierarchy-specific queries.
Supports recursive CTE tree queries, soft delete validation,
and circular reference detection.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.category import Category
from app.repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Repository for Category operations with hierarchical support."""

    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def create(self, category: Category) -> Category:
        """Create a new category."""
        return await super().create(category)

    async def get_by_id(self, category_id: int) -> Optional[Category]:
        """Get category by ID. Excludes soft-deleted."""
        return await super().get_by_id(category_id)

    async def get_by_id_including_deleted(
        self, category_id: int
    ) -> Optional[Category]:
        """Get category by ID including soft-deleted ones."""
        result = await self.session.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def list_all(
        self, skip: int = 0, limit: int = 100
    ) -> List[Category]:
        """List all active non-deleted categories."""
        result = await self.session.execute(
            select(Category)
            .where(
                Category.deleted_at.is_(None),
                Category.is_active.is_(True),
            )
            .order_by(Category.sort_order, Category.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update(
        self, category_id: int, data: dict
    ) -> Optional[Category]:
        """Update a category."""
        return await super().update(category_id, data)

    async def soft_delete(self, category_id: int) -> bool:
        """Soft delete a category by setting deleted_at."""
        return await super().soft_delete(category_id)

    async def get_tree(self) -> List[Category]:
        """Fetch all active non-deleted categories via recursive CTE.

        Returns a flat list ordered by tree hierarchy, which the service
        layer will assemble into a nested structure.
        """
        query = text("""
            WITH RECURSIVE category_tree AS (
                -- Anchor: root categories (no parent)
                SELECT id, name, description, image_url, parent_id,
                       sort_order, is_active, created_at, updated_at,
                       deleted_at, 0 AS depth
                FROM category
                WHERE parent_id IS NULL
                  AND deleted_at IS NULL
                  AND is_active = TRUE

                UNION ALL

                -- Recursive: children of each level
                SELECT c.id, c.name, c.description, c.image_url, c.parent_id,
                       c.sort_order, c.is_active, c.created_at, c.updated_at,
                       c.deleted_at, ct.depth + 1
                FROM category c
                INNER JOIN category_tree ct ON c.parent_id = ct.id
                WHERE c.deleted_at IS NULL
                  AND c.is_active = TRUE
            )
            SELECT id, name, description, image_url, parent_id,
                   sort_order, is_active, created_at, updated_at, deleted_at
            FROM category_tree
            ORDER BY depth, sort_order, name
        """)

        result = await self.session.execute(query)
        rows = result.fetchall()

        categories = []
        for row in rows:
            cat = Category(
                id=row.id,
                name=row.name,
                description=row.description,
                image_url=row.image_url,
                parent_id=row.parent_id,
                sort_order=row.sort_order,
                is_active=row.is_active,
                created_at=row.created_at,
                updated_at=row.updated_at,
                deleted_at=row.deleted_at,
            )
            categories.append(cat)

        return categories

    async def has_active_children(self, category_id: int) -> bool:
        """Check if a category has any active (non-deleted) children."""
        result = await self.session.execute(
            select(Category.id).where(
                Category.parent_id == category_id,
                Category.deleted_at.is_(None),
                Category.is_active.is_(True),
            ).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def get_ancestor_ids(
        self, category_id: int, max_depth: int = 10
    ) -> List[int]:
        """Walk up the parent chain and return all ancestor IDs.

        Used for circular reference detection during parent updates.
        Returns empty list if category not found or is root.
        Limits traversal to max_depth to prevent infinite loops.
        """
        query = text("""
            WITH RECURSIVE ancestors AS (
                -- Start from the given category
                SELECT parent_id, 0 AS depth
                FROM category
                WHERE id = :cat_id

                UNION ALL

                -- Walk up the parent chain
                SELECT c.parent_id, a.depth + 1
                FROM category c
                INNER JOIN ancestors a ON c.id = a.parent_id
                WHERE c.parent_id IS NOT NULL
                  AND a.depth < :max_depth
            )
            SELECT parent_id FROM ancestors
            WHERE parent_id IS NOT NULL
            ORDER BY depth
        """)

        result = await self.session.execute(
            query, {"cat_id": category_id, "max_depth": max_depth}
        )
        return [row[0] for row in result.fetchall()]

    async def get_children_count(self, category_id: int) -> int:
        """Count active (non-deleted) children of a category."""
        result = await self.session.execute(
            select(Category.id).where(
                Category.parent_id == category_id,
                Category.deleted_at.is_(None),
                Category.is_active.is_(True),
            )
        )
        return len(list(result.scalars().all()))

    async def get_children(self, category_id: int) -> List[Category]:
        """Get direct active children of a category."""
        result = await self.session.execute(
            select(Category)
            .where(
                Category.parent_id == category_id,
                Category.deleted_at.is_(None),
                Category.is_active.is_(True),
            )
            .order_by(Category.sort_order, Category.name)
        )
        return list(result.scalars().all())
