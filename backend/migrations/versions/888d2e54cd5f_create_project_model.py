"""Create Project model

Revision ID: 888d2e54cd5f
Revises: 448e0ee1c9b5
Create Date: 2024-07-14 12:05:02.464044

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "888d2e54cd5f"
down_revision = "448e0ee1c9b5"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("project")
