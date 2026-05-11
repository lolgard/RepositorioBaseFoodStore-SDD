"""
Router for system configuration CRUD.
Admin-only endpoints for managing key-value configs.
"""
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.database import get_session
from app.routers.dependencies import require_role
from app.models.user import User, UserRole
from app.models.system_config import SystemConfig
from app.schemas.system_config import ConfigResponse, ConfigUpdate

router = APIRouter(prefix="/api/v1/admin/config", tags=["system_config"])


@router.get("/")
async def list_configs(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    result = await session.execute(select(SystemConfig).order_by(SystemConfig.key))
    configs = result.scalars().all()
    return [
        ConfigResponse(
            key=c.key,
            value=c.value,
            description=c.description,
            updated_at=str(c.updated_at),
        )
        for c in configs
    ]


@router.put("/{key}")
async def update_config(
    key: str,
    data: ConfigUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    result = await session.execute(select(SystemConfig).where(SystemConfig.key == key))
    config = result.scalar_one_or_none()
    if not config:
        config = SystemConfig(key=key, value=data.value)
        session.add(config)
    else:
        config.value = data.value
        session.add(config)

    await session.commit()
    await session.refresh(config)

    return ConfigResponse(
        key=config.key,
        value=config.value,
        description=config.description,
        updated_at=str(config.updated_at),
    )
