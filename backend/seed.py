"""
Seed script: creates default admin user.
Run with: python seed.py
"""
import asyncio

from passlib.context import CryptContext
from sqlmodel import select

from app.core.database import async_session, engine
from app.models.user import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = "admin@foodstore.com"
ADMIN_PASSWORD = "admin123!"  # Change in production!


async def seed():
    """Create default admin user if not exists."""
    async with async_session() as session:
        # Check if admin already exists
        result = await session.exec(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.first()

        if existing:
            print(f"Admin user already exists (id={existing.id})")
            return

        # Create admin user
        admin = User(
            email=ADMIN_EMAIL,
            first_name="Admin",
            last_name="Food Store",
            password_hash=pwd_context.hash(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        print(f"Admin user created (id={admin.id}, email={ADMIN_EMAIL})")


if __name__ == "__main__":
    asyncio.run(seed())
