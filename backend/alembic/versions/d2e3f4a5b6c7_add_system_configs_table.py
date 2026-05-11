"""add system configs table

Revision ID: d2e3f4a5b6c7
Revises: d1e2f3a4b5c6
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision = 'd2e3f4a5b6c7'
down_revision = 'd1e2f3a4b5c6'


def upgrade():
    op.create_table('system_configs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('value', sa.Text(), nullable=False, server_default=''),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key'),
    )
    op.create_index(op.f('ix_system_configs_key'), 'system_configs', ['key'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_system_configs_key'), table_name='system_configs')
    op.drop_table('system_configs')
