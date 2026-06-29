"""add promotion field to listings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-27 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "listings",
        sa.Column("promotion", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index(op.f("ix_listings_promotion"), "listings", ["promotion"], unique=False)
    op.alter_column("listings", "promotion", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_listings_promotion"), table_name="listings")
    op.drop_column("listings", "promotion")
