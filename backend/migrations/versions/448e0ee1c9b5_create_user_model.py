"""Create User model

Revision ID: 448e0ee1c9b5
Revises: 
Create Date: 2024-07-14 12:03:39.210880

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '448e0ee1c9b5'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=80), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )

def downgrade():
    op.drop_table('user')