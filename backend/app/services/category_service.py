"""
Category service.
Handles hierarchical CRUD, tree assembly from CTE results,
soft delete validation, and circular reference detection.
"""
from datetime import datetime
from typing import List, Optional

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryTreeNode,
    CategoryUpdate,
)


class CategoryService:
    """Service for category management operations."""

    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    async def create(self, data: CategoryCreate) -> CategoryResponse:
        """Create a new category."""
        # Validate parent exists if provided
        if data.parent_id is not None:
            parent = await self.category_repo.get_by_id_including_deleted(
                data.parent_id
            )
            if not parent:
                raise NotFoundError("Parent category", data.parent_id)
            if parent.deleted_at is not None:
                raise NotFoundError("Parent category", data.parent_id)

        category = Category(
            name=data.name,
            description=data.description,
            image_url=data.image_url,
            parent_id=data.parent_id,
            sort_order=data.sort_order,
            is_active=data.is_active,
        )
        created = await self.category_repo.create(category)
        return CategoryResponse.model_validate(created)

    async def get_by_id(self, category_id: int) -> CategoryResponse:
        """Get a category by ID."""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundError("Category", category_id)
        return CategoryResponse.model_validate(category)

    async def get_tree(self) -> List[CategoryTreeNode]:
        """Get the full category tree (flat CTE -> nested structure)."""
        flat_categories = await self.category_repo.get_tree()
        return self._build_tree(flat_categories)

    async def get_with_children(
        self, category_id: int
    ) -> CategoryTreeNode:
        """Get a single category with its direct active children."""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundError("Category", category_id)

        children = await self.category_repo.get_children(category_id)
        child_nodes = [
            CategoryTreeNode(
                **CategoryResponse.model_validate(c).model_dump(),
                children=[],
            ) for c in children
        ]

        # Use CategoryResponse to avoid lazy-loading ORM children relationship
        category_resp = CategoryResponse.model_validate(category)
        return CategoryTreeNode(
            **category_resp.model_dump(),
            children=child_nodes,
        )

    async def update(
        self, category_id: int, data: CategoryUpdate
    ) -> CategoryResponse:
        """Update an existing category."""
        existing = await self.category_repo.get_by_id(category_id)
        if not existing:
            raise NotFoundError("Category", category_id)

        update_data = data.model_dump(exclude_unset=True)

        # Handle parent_id update
        if "parent_id" in update_data:
            new_parent_id = update_data["parent_id"]

            # Cannot set parent to self
            if new_parent_id == category_id:
                raise ValidationError(
                    "A category cannot be its own parent"
                )

            # Validate parent exists
            if new_parent_id is not None:
                parent = await self.category_repo.get_by_id_including_deleted(
                    new_parent_id
                )
                if not parent:
                    raise NotFoundError("Parent category", new_parent_id)
                if parent.deleted_at is not None:
                    raise NotFoundError("Parent category", new_parent_id)

                # Check for circular reference
                ancestors = await self.category_repo.get_ancestor_ids(
                    new_parent_id
                )
                if category_id in ancestors:
                    raise ValidationError(
                        "Circular reference detected: "
                        "the selected parent would create a cycle"
                    )

        updated = await self.category_repo.update(category_id, update_data)
        if not updated:
            raise NotFoundError("Category", category_id)

        return CategoryResponse.model_validate(updated)

    async def soft_delete(self, category_id: int) -> None:
        """Soft delete a category (blocks if it has active children)."""
        category = await self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundError("Category", category_id)

        # Check for active children
        if await self.category_repo.has_active_children(category_id):
            raise ConflictError(
                "Cannot delete category with active children. "
                "Remove or reassign children first."
            )

        await self.category_repo.soft_delete(category_id)

    def _build_tree(
        self, flat_categories: List[Category]
    ) -> List[CategoryTreeNode]:
        """Build a nested tree from a flat list of categories.

        Uses a dict lookup for O(n) tree assembly.
        """
        nodes: dict[int, CategoryTreeNode] = {}
        roots: List[CategoryTreeNode] = []

        # First pass: create all nodes
        for cat in flat_categories:
            node = CategoryTreeNode.model_validate(cat)
            nodes[cat.id] = node

        # Second pass: nest children under parents
        for cat in flat_categories:
            node = nodes[cat.id]
            if cat.parent_id is not None and cat.parent_id in nodes:
                parent = nodes[cat.parent_id]
                parent.children.append(node)
            else:
                roots.append(node)

        return roots
