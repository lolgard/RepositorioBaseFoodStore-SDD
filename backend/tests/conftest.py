"""
Pytest configuration for async FastAPI testing.
Provides test database session and client fixtures.
"""
import pytest
from typing import AsyncGenerator

from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import get_session


@pytest.fixture(scope="function")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create a test in-memory SQLite engine."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=True,
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.fixture(scope="function")
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test session bound to the test engine."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session


@pytest.fixture(scope="function")
async def client(test_session) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client that uses the test session."""

    async def override_get_session():
        yield test_session

    app.dependency_overrides[get_session] = override_get_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
