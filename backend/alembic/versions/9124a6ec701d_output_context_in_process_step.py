"""output context in process step

Revision ID: 9124a6ec701d
Revises: 86611d367b4e
Create Date: 2024-09-17 17:50:49.133817

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9124a6ec701d"
down_revision: Union[str, None] = "86611d367b4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "process_steps", sa.Column("output_references", sa.JSON(), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("process_steps", "output_references")
    # ### end Alembic commands ###
