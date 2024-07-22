"""Merge 284ed84c1933 and fc88c981b40e

Revision ID: ccfafd40eaf9
Revises: 284ed84c1933, fc88c981b40e
Create Date: 2024-07-22 16:17:53.582823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ccfafd40eaf9'
down_revision: Union[str, None] = ('284ed84c1933', 'fc88c981b40e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
