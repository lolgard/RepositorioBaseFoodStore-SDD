"""
Ingredient service.
Handles CRUD operations with duplicate name validation
and allergen-aware filtering.
"""
from typing import List, Optional

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.ingredient import Ingredient
from app.repositories.ingredient_repository import IngredientRepository
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientResponse,
    IngredientUpdate,
)


class IngredientService:
    """Service for ingredient management operations."""

    def __init__(self, ingredient_repo: IngredientRepository):
        self.ingredient_repo = ingredient_repo

    async def create(self, data: IngredientCreate) -> IngredientResponse:
        """Create a new ingredient. Validates unique name."""
        # Check for duplicate name (case-insensitive)
        if await self.ingredient_repo.count_by_name(data.name) > 0:
            raise ConflictError(
                f"An ingredient with name '{data.name}' already exists"
            )

        ingredient = Ingredient(
            name=data.name,
            description=data.description,
            es_alergeno=data.es_alergeno,
        )
        created = await self.ingredient_repo.create(ingredient)
        return IngredientResponse.model_validate(created)

    async def get_by_id(self, ingredient_id: int) -> IngredientResponse:
        """Get an ingredient by ID."""
        ingredient = await self.ingredient_repo.get_by_id(ingredient_id)
        if not ingredient:
            raise NotFoundError("Ingredient", ingredient_id)
        return IngredientResponse.model_validate(ingredient)

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        es_alergeno: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> tuple[List[IngredientResponse], int]:
        """List ingredients with optional filters."""
        ingredients = await self.ingredient_repo.list_all(
            skip=skip, limit=limit,
            es_alergeno=es_alergeno, search=search,
        )
        total = await self.ingredient_repo.count(
            es_alergeno=es_alergeno, search=search,
        )
        items = [
            IngredientResponse.model_validate(i) for i in ingredients
        ]
        return items, total

    async def update(
        self, ingredient_id: int, data: IngredientUpdate
    ) -> IngredientResponse:
        """Update an existing ingredient."""
        existing = await self.ingredient_repo.get_by_id(ingredient_id)
        if not existing:
            raise NotFoundError("Ingredient", ingredient_id)

        update_data = data.model_dump(exclude_unset=True)

        # Check duplicate name if name is being changed
        if "name" in update_data and update_data["name"].lower() != existing.name.lower():
            if await self.ingredient_repo.count_by_name(update_data["name"]) > 0:
                raise ConflictError(
                    f"An ingredient with name '{update_data['name']}' already exists"
                )

        updated = await self.ingredient_repo.update(
            ingredient_id, update_data
        )
        if not updated:
            raise NotFoundError("Ingredient", ingredient_id)

        return IngredientResponse.model_validate(updated)

    async def soft_delete(self, ingredient_id: int) -> None:
        """Soft delete an ingredient."""
        ingredient = await self.ingredient_repo.get_by_id(ingredient_id)
        if not ingredient:
            raise NotFoundError("Ingredient", ingredient_id)

        await self.ingredient_repo.soft_delete(ingredient_id)
