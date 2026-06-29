"""add promotion details to listings

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-27 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("listings", sa.Column("promotion_old_price", sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column("listings", sa.Column("promotion_new_price", sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column("listings", sa.Column("promotion_conditions", sa.Text(), nullable=False, server_default=""))
    op.alter_column("listings", "promotion_conditions", server_default=None)


def downgrade() -> None:
    op.drop_column("listings", "promotion_conditions")
    op.drop_column("listings", "promotion_new_price")
    op.drop_column("listings", "promotion_old_price")
