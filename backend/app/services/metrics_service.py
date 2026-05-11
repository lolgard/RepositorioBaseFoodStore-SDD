from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any
from sqlalchemy import func, select as sa_select
from sqlmodel import select
from app.models.order import Order, OrderItem
from app.models.user import User


class MetricsService:
    def __init__(self, session):
        self.session = session

    async def get_summary(self) -> dict[str, Any]:
        user_result = await self.session.execute(
            select(func.count(User.id)).where(User.deleted_at.is_(None))
        )
        total_users = user_result.scalar() or 0

        order_result = await self.session.execute(
            select(func.count(Order.id)).where(Order.deleted_at.is_(None))
        )
        total_orders = order_result.scalar() or 0

        revenue_result = await self.session.execute(
            select(func.coalesce(func.sum(Order.total), 0))
            .where(Order.status == "DELIVERED", Order.deleted_at.is_(None))
        )
        total_revenue = float(revenue_result.scalar() or 0)

        avg_result = await self.session.execute(
            select(func.avg(Order.total)).where(Order.deleted_at.is_(None))
        )
        avg_order = float(avg_result.scalar() or 0)

        return {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "average_order_value": round(avg_order, 2),
        }

    async def get_sales_evolution(self, days: int = 30) -> list[dict[str, Any]]:
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.session.execute(
            sa_select(
                func.date(Order.created_at).label("date"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .where(Order.status == "DELIVERED", Order.created_at >= since, Order.deleted_at.is_(None))
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
        rows = result.all()
        return [
            {"date": str(row.date), "revenue": float(row.revenue), "orders": row.orders}
            for row in rows
        ]

    async def get_top_products(self, limit: int = 10) -> list[dict[str, Any]]:
        result = await self.session.execute(
            sa_select(
                OrderItem.product_name,
                func.sum(OrderItem.quantity).label("total_quantity"),
                func.sum(OrderItem.subtotal).label("total_revenue"),
            )
            .select_from(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.deleted_at.is_(None))
            .group_by(OrderItem.product_name, OrderItem.product_id)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
        )
        rows = result.all()
        return [
            {
                "product_name": row.product_name,
                "total_quantity": int(row.total_quantity),
                "total_revenue": float(row.total_revenue),
            }
            for row in rows
        ]

    async def get_orders_by_status(self) -> list[dict[str, Any]]:
        result = await self.session.execute(
            sa_select(
                Order.status,
                func.count(Order.id).label("count"),
            )
            .where(Order.deleted_at.is_(None))
            .group_by(Order.status)
            .order_by(Order.status)
        )
        rows = result.all()
        return [{"status": row.status, "count": row.count} for row in rows]
