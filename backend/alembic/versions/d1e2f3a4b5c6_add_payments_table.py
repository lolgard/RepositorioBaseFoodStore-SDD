"""add payments table

Revision ID: d1e2f3a4b5c6
Revises: c1d2e3f4a5b6
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision = 'd1e2f3a4b5c6'
down_revision = 'c1d2e3f4a5b6'


def upgrade():
    op.create_table('payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('mp_preference_id', sa.String(100), nullable=True),
        sa.Column('mp_payment_id', sa.String(100), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('status_detail', sa.Text(), nullable=True),
        sa.Column('transaction_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payer_email', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_payments_order_id'), 'payments', ['order_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_payments_order_id'), table_name='payments')
    op.drop_table('payments')
