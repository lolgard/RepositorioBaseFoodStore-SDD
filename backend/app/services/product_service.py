"""
Product service.
Handles CRUD operations with duplicate name validation,
category/ingredient association management, and filtered listing.
"""
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.category import Category
from app.models.ingredient import Ingredient
from app.models.product import Product, ProductCategory, ProductIngredient
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)


class ProductService:
    """Service for product management operations."""

    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    async def _validate_categories(
        self, category_ids: List[int], session: AsyncSession
    ) -> None:
        """Validate that all category IDs exist."""
        from sqlmodel import select
        for cat_id in category_ids:
            result = await session.execute(
                select(Category).where(Category.id == cat_id, Category.deleted_at.is_(None))
            )
            if not result.scalar_one_or_none():
                raise NotFoundError("Category", cat_id)

    async def _validate_ingredients(
        self, ingredient_ids: List[int], session: AsyncSession
    ) -> None:
        """Validate that all ingredient IDs exist."""
        from sqlmodel import select
        for ing_id in ingredient_ids:
            result = await session.execute(
                select(Ingredient).where(Ingredient.id == ing_id, Ingredient.deleted_at.is_(None))
            )
            if not result.scalar_one_or_none():
                raise NotFoundError("Ingredient", ing_id)

    async def create(
        self, data: ProductCreate, session: AsyncSession
    ) -> ProductResponse:
        """Create a new product with category and ingredient associations."""
        # Check for duplicate name
        if await self.product_repo.count_by_name(data.name) > 0:
            raise ConflictError(
                f"A product with name '{data.name}' already exists"
            )

        # Validate associations exist
        if data.category_ids:
            await self._validate_categories(data.category_ids, session)
        if data.ingredient_ids:
            await self._validate_ingredients(data.ingredient_ids, session)

        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
            stock=data.stock,
            available=data.available,
            image_url=data.image_url,
        )
        created = await self.product_repo.create(product)

        # Sync associations
        if data.category_ids:
            await self.product_repo.sync_categories(
                created.id, data.category_ids
            )
        if data.ingredient_ids:
            await self.product_repo.sync_ingredients(
                created.id, data.ingredient_ids
            )

        # Reload to get associations
        await session.refresh(created)
        return await self._build_response(created.id)

    async def get_by_id(self, product_id: int) -> ProductResponse:
        """Get a product by ID."""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product", product_id)
        return await self._build_response(product_id)

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
    ) -> Tuple[List[ProductResponse], int]:
        """List products with optional filters."""
        products = await self.product_repo.list_all(
            skip=skip,
            limit=limit,
            category_id=category_id,
            ingredient_id=ingredient_id,
            search=search,
            available=available,
            min_price=min_price,
            max_price=max_price,
            min_stock=min_stock,
        )
        total = await self.product_repo.count(
            category_id=category_id,
            ingredient_id=ingredient_id,
            search=search,
            available=available,
            min_price=min_price,
            max_price=max_price,
            min_stock=min_stock,
        )
        items = [await self._build_response(p.id) for p in products]
        return items, total

    async def update(
        self, product_id: int, data: ProductUpdate, session: AsyncSession
    ) -> ProductResponse:
        """Update an existing product."""
        existing = await self.product_repo.get_by_id(product_id)
        if not existing:
            raise NotFoundError("Product", product_id)

        update_data = data.model_dump(exclude_unset=True)

        # Check duplicate name if name is being changed
        if "name" in update_data:
            name_in = update_data["name"]
            if name_in.lower() != existing.name.lower():
                if await self.product_repo.count_by_name(name_in) > 0:
                    raise ConflictError(
                        f"A product with name '{name_in}' already exists"
                    )

        # Pop association fields before updating the product model
        category_ids = update_data.pop("category_ids", None)
        ingredient_ids = update_data.pop("ingredient_ids", None)

        updated = await self.product_repo.update(product_id, update_data)
        if not updated:
            raise NotFoundError("Product", product_id)

        # Sync associations if provided
        if category_ids is not None:
            if category_ids:
                await self._validate_categories(category_ids, session)
            await self.product_repo.sync_categories(product_id, category_ids)

        if ingredient_ids is not None:
            if ingredient_ids:
                await self._validate_ingredients(ingredient_ids, session)
            await self.product_repo.sync_ingredients(
                product_id, ingredient_ids
            )

        return await self._build_response(product_id)

    async def soft_delete(self, product_id: int) -> None:
        """Soft delete a product."""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product", product_id)

        await self.product_repo.soft_delete(product_id)

    async def _build_response(
        self, product_id: int
    ) -> ProductResponse:
        """Build a ProductResponse with associations."""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product", product_id)

        category_ids = await self.product_repo.get_category_ids(product_id)
        ingredient_ids = await self.product_repo.get_ingredient_ids(
            product_id
        )

        resp = ProductResponse.model_validate(product)
        resp.category_ids = category_ids
        resp.ingredient_ids = ingredient_ids
        return resp
