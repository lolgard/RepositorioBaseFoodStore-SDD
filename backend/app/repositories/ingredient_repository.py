"""
Ingredient repository extending BaseRepository with filtered queries.
Supports allergen filtering and name search.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.models.ingredient import Ingredient
from app.repositories.base_repository import BaseRepository


class IngredientRepository(BaseRepository[Ingredient]):
    """Repository for Ingredient operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(Ingredient, session)

    async def create(self, ingredient: Ingredient) -> Ingredient:
        """Create a new ingredient."""
        return await super().create(ingredient)

    async def get_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        """Get ingredient by ID. Excludes soft-deleted."""
        return await super().get_by_id(ingredient_id)

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        es_alergeno: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> List[Ingredient]:
        """List ingredients with optional filters.

        Supports filtering by allergen status and name search (ILIKE).
        Excludes soft-deleted by default.
        """
        query = select(Ingredient).where(Ingredient.deleted_at.is_(None))

        if es_alergeno is not None:
            query = query.where(Ingredient.es_alergeno.is_(es_alergeno))

        if search:
            query = query.where(Ingredient.name.ilike(f"%{search}%"))

        query = query.order_by(Ingredient.name).offset(skip).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        es_alergeno: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> int:
        """Count ingredients matching optional filters."""
        query = select(func.count(Ingredient.id)).where(
            Ingredient.deleted_at.is_(None)
        )

        if es_alergeno is not None:
            query = query.where(Ingredient.es_alergeno.is_(es_alergeno))

        if search:
            query = query.where(Ingredient.name.ilike(f"%{search}%"))

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def update(
        self, ingredient_id: int, data: dict
    ) -> Optional[Ingredient]:
        """Update an ingredient."""
        return await super().update(ingredient_id, data)

    async def soft_delete(self, ingredient_id: int) -> bool:
        """Soft delete an ingredient by setting deleted_at."""
        return await super().soft_delete(ingredient_id)

    async def count_by_name(self, name: str) -> int:
        """Count ingredients with the given name (case-insensitive).
        Used for duplicate detection before create/update.
        """
        result = await self.session.execute(
            select(func.count(Ingredient.id)).where(
                Ingredient.name.ilike(name),
                Ingredient.deleted_at.is_(None),
            )
        )
        return result.scalar() or 0
