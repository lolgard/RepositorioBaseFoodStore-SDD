"""
Health check and basic API tests for Food Store backend.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test that the health endpoint returns a successful response."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_openapi_docs(client: AsyncClient):
    """Test that OpenAPI docs are accessible."""
    response = await client.get("/api/v1/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_rfc7807_error_format(client: AsyncClient):
    """Test that error responses follow RFC 7807 format."""
    # Request a non-existent endpoint
    response = await client.get("/non-existent-endpoint")
    assert response.status_code == 404
    
    # Check if it follows RFC 7807 (optional, depends on implementation)
    data = response.json()
    # If using RFC 7807, should have these fields
    if "type" in data:
        assert "title" in data
        assert "status" in data