"""Create Asset model

Revision ID: bb6280fbb9c3
Revises: 888d2e54cd5f
Create Date: 2024-07-14 12:05:06.269417

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb6280fbb9c3'
down_revision = '888d2e54cd5f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('asset',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('path', sa.String(length=255), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('asset')
