"""add delivery_address table

Revision ID: b1c2d3e4f5a6
Revises: a2b2c3d4e5f6
Create Date: 2026-05-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'a2b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('delivery_address',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('street', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False),
        sa.Column('street_number', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('city', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('state', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('zip_code', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('country', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False, server_default='Argentina'),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('additional_info', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_delivery_address_user_id'), 'delivery_address', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_delivery_address_user_id'), table_name='delivery_address')
    op.drop_table('delivery_address')
