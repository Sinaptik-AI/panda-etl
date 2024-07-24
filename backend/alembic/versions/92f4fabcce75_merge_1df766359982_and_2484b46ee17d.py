"""Merge 1df766359982 and 2484b46ee17d

Revision ID: 92f4fabcce75
Revises: 1df766359982, 2484b46ee17d
Create Date: 2024-07-25 00:37:38.598542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92f4fabcce75'
down_revision: Union[str, None] = ('1df766359982', '2484b46ee17d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
