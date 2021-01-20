"""Rename oprations_v2 to operations.

Revision ID: 71e95818e76e
Revises: e5af5cb8c05c
Create Date: 2021-01-15 12:35:22.826630

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '71e95818e76e'
down_revision = 'e5af5cb8c05c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('rule_entries') as batch_op:
        batch_op.add_column(sa.Column('operations', sa.JSON(), nullable=True))
        batch_op.drop_column('operations_v2')


def downgrade():
    with op.batch_alter_table('rule_entries') as batch_op:
        batch_op.add_column(sa.Column('operations_v2', sqlite.JSON(), nullable=True))
        batch_op.drop_column('operations')
