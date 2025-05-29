"""Rename amount to quantity in trades table

Revision ID: a06c130caeb3
Revises: cf8177402384
Create Date: 2025-05-27 12:43:37.835058

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'a06c130caeb3'
down_revision = 'cf8177402384'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('trades', 'amount', new_column_name='quantity')


def downgrade():
    op.alter_column('trades', 'quantity', new_column_name='amount')
