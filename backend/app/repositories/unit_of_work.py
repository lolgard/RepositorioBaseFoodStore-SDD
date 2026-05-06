"""
Unit of Work pattern implementation.
Async context manager that encapsulates a session and exposes repositories.
"""
from typing import AsyncGenerator, Type, TypeVar

from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import async_session
from app.repositories.base_repository import BaseRepository

T = TypeVar("T", bound="SQLModel")


class UnitOfWork:
    """
    Async context manager for transactional operations.
    Exposes repositories as attributes.
    """

    def __init__(self):
        self.session: AsyncSession = None  # type: ignore
        self._repositories: dict = {}

    async def __aenter__(self):
        self.session = async_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.session.rollback()
        else:
            await self.session.commit()
        await self.session.close()

    def get_repository(self, repo_class: Type[BaseRepository]) -> BaseRepository:
        """
        Get or create a repository instance.
        Caches repositories for this UoW instance.
        """
        if repo_class not in self._repositories:
            # Infer model type from repository class
            # This is a simplified version - in real usage you'd parametrize properly
            self._repositories[repo_class] = repo_class(session=self.session)
        return self._repositories[repo_class]

    # Example property for a specific repository
    # @property
    # def usuarios(self) -> "UsuarioRepository":
    #     return self.get_repository(UsuarioRepository)
