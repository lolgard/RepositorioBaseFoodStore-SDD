"""
Sample test to verify FastAPI app starts and health check works.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test that the health check endpoint returns OK."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_openapi_docs(client: AsyncClient):
    """Test that OpenAPI docs are accessible."""
    response = await client.get("/api/v1/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_rfc7807_error_format(client: AsyncClient):
    """Test that 404 errors follow RFC 7807 format."""
    response = await client.get("/api/v1/nonexistent-endpoint")
    assert response.status_code == 404
    data = response.json()
    assert "type" in data
    assert "title" in data
    assert "status" in data
    assert data["status"] == 404
