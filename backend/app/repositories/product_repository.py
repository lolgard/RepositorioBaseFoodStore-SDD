"""
Product repository extending BaseRepository with filtered queries.
Supports category/ingredient filtering, search, price/stock range.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.product import Product, ProductCategory, ProductIngredient
from app.repositories.base_repository import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Repository for Product operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(Product, session)

    async def create(self, product: Product) -> Product:
        """Create a new product."""
        return await super().create(product)

    async def get_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID. Excludes soft-deleted."""
        return await super().get_by_id(product_id)

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        ingredient_id: Optional[int] = None,
        search: Optional[str] = None,
        available: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_stock: Optional[int] = None,
    ) -> List[Product]:
        """List products with optional filters. Excludes soft-deleted."""
        query = select(Product).where(Product.deleted_at.is_(None))

        if category_id is not None:
            query = query.join(ProductCategory).where(
                ProductCategory.category_id == category_id
            )

        if ingredient_id is not None:
            query = query.join(ProductIngredient).where(
                ProductIngredient.ingredient_id == ingredient_id
            )

        if search:
            query = query.where(Product.name.ilike(f"%{search}%"))

        if available is not None:
            query = query.where(Product.available.is_(available))

        if min_price is not None:
            query = query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)

        if min_stock is not None:
            query = query.where(Product.stock >= min_stock)

        query = query.offset(skip).limit(limit).distinct()
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        category_id: Optional[int] = None,
        ingredient_id: Optional[int] = None,
        search: Optional[str] = None,
        available: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_stock: Optional[int] = None,
    ) -> int:
        """Count products matching optional filters."""
        query = select(func.count(Product.id.distinct())).where(
            Product.deleted_at.is_(None)
        )

        if category_id is not None:
            query = query.join(ProductCategory).where(
                ProductCategory.category_id == category_id
            )

        if ingredient_id is not None:
            query = query.join(ProductIngredient).where(
                ProductIngredient.ingredient_id == ingredient_id
            )

        if search:
            query = query.where(Product.name.ilike(f"%{search}%"))

        if available is not None:
            query = query.where(Product.available.is_(available))

        if min_price is not None:
            query = query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)

        if min_stock is not None:
            query = query.where(Product.stock >= min_stock)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def update(
        self, product_id: int, data: dict
    ) -> Optional[Product]:
        """Update a product."""
        return await super().update(product_id, data)

    async def soft_delete(self, product_id: int) -> bool:
        """Soft delete a product by setting deleted_at."""
        return await super().soft_delete(product_id)

    async def count_by_name(self, name: str) -> int:
        """Count products with the given name (case-insensitive).
        Used for duplicate detection before create/update.
        Excludes soft-deleted.
        """
        result = await self.session.execute(
            select(func.count(Product.id)).where(
                func.lower(Product.name) == func.lower(name),
                Product.deleted_at.is_(None),
            )
        )
        return result.scalar() or 0

    async def sync_categories(
        self, product_id: int, category_ids: List[int]
    ) -> None:
        """Replace all category associations for a product."""
        existing = await self.session.execute(
            select(ProductCategory).where(
                ProductCategory.product_id == product_id
            )
        )
        for assoc in existing.scalars().all():
            await self.session.delete(assoc)
        for cat_id in category_ids:
            self.session.add(
                ProductCategory(
                    product_id=product_id, category_id=cat_id
                )
            )
        await self.session.flush()

    async def sync_ingredients(
        self, product_id: int, ingredient_ids: List[int]
    ) -> None:
        """Replace all ingredient associations for a product."""
        existing = await self.session.execute(
            select(ProductIngredient).where(
                ProductIngredient.product_id == product_id
            )
        )
        for assoc in existing.scalars().all():
            await self.session.delete(assoc)
        for ing_id in ingredient_ids:
            self.session.add(
                ProductIngredient(
                    product_id=product_id, ingredient_id=ing_id
                )
            )
        await self.session.flush()

    async def get_category_ids(self, product_id: int) -> List[int]:
        """Get all category IDs for a product."""
        result = await self.session.execute(
            select(ProductCategory.category_id).where(
                ProductCategory.product_id == product_id
            )
        )
        return [row[0] for row in result.fetchall()]

    async def get_ingredient_ids(self, product_id: int) -> List[int]:
        """Get all ingredient IDs for a product."""
        result = await self.session.execute(
            select(ProductIngredient.ingredient_id).where(
                ProductIngredient.product_id == product_id
            )
        )
        return [row[0] for row in result.fetchall()]

    async def count_by_category(self, category_id: int) -> int:
        """Count products in a category. Used to check if a category has products."""
        result = await self.session.execute(
            select(func.count(ProductCategory.product_id)).where(
                ProductCategory.category_id == category_id
            )
        )
        return result.scalar() or 0

