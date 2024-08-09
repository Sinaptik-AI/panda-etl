"""store_asset_content_update

Revision ID: 1aea8dc0bfda
Revises: 52638004c665
Create Date: 2024-08-08 15:44:02.812843

"""

import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1aea8dc0bfda"
down_revision: Union[str, None] = "52638004c665"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the new language column
    op.add_column(
        "asset_contents",
        sa.Column(
            "language", sa.String(length=10), nullable=False, server_default="en"
        ),
    )

    # Add a new JSON column to temporarily hold the converted content data
    op.add_column("asset_contents", sa.Column("content_new", sa.JSON(), nullable=False))

    # Migrate data from the old content column to the new JSON column
    connection = op.get_bind()
    asset_contents = connection.execute(
        sa.text("SELECT id, content FROM asset_contents")
    ).fetchall()

    for row in asset_contents:
        content_json = json.loads(row["content"]) if row["content"] else {}
        connection.execute(
            sa.text(
                "UPDATE asset_contents SET content_new = :content_new WHERE id = :id"
            ),
            {"content_new": content_json, "id": row["id"]},
        )

    # Drop the old content column
    with op.batch_alter_table("asset_contents") as batch_op:
        batch_op.drop_column("content")

    # Rename the new JSON column to the original name
    with op.batch_alter_table("asset_contents") as batch_op:
        batch_op.alter_column("content_new", new_column_name="content")


def downgrade() -> None:
    # Add the old content column back as TEXT
    op.add_column("asset_contents", sa.Column("content_old", sa.Text(), nullable=False))

    # Migrate data from the JSON content column to the old TEXT column
    connection = op.get_bind()
    asset_contents = connection.execute(
        sa.text("SELECT id, content FROM asset_contents")
    ).fetchall()

    for row in asset_contents:
        content_text = json.dumps(row["content"]) if row["content"] else ""
        connection.execute(
            sa.text(
                "UPDATE asset_contents SET content_old = :content_old WHERE id = :id"
            ),
            {"content_old": content_text, "id": row["id"]},
        )

    # Drop the JSON content column
    with op.batch_alter_table("asset_contents") as batch_op:
        batch_op.drop_column("content")

    # Rename the old TEXT column back to the original name
    with op.batch_alter_table("asset_contents") as batch_op:
        batch_op.alter_column("content_old", new_column_name="content")

    # Drop the language column
    op.drop_column("asset_contents", "language")
