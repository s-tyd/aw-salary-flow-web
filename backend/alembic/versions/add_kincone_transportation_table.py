"""add_kincone_transportation_table

Revision ID: kincone_transportation_001
Revises: freee_expense_001
Create Date: 2025-05-31 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'kincone_transportation_001'
down_revision = 'freee_expense_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create kincone_transportation table
    op.create_table('kincone_transportation',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('calculation_period_id', sa.Integer(), nullable=True),
    sa.Column('employee_id', sa.Integer(), nullable=True),
    sa.Column('employee_number', sa.String(), nullable=True),
    sa.Column('employee_name', sa.String(), nullable=True),
    sa.Column('usage_date', sa.Date(), nullable=True),
    sa.Column('departure', sa.String(), nullable=True),
    sa.Column('destination', sa.String(), nullable=True),
    sa.Column('transportation_type', sa.String(), nullable=True),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('usage_count', sa.Integer(), nullable=True),
    sa.Column('route_info', sa.Text(), nullable=True),
    sa.Column('purpose', sa.String(), nullable=True),
    sa.Column('approval_status', sa.String(), nullable=True),
    sa.Column('data_source', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['calculation_period_id'], ['calculation_periods.id'], ),
    sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kincone_transportation_id'), 'kincone_transportation', ['id'], unique=False)


def downgrade() -> None:
    # Drop kincone_transportation table
    op.drop_index(op.f('ix_kincone_transportation_id'), table_name='kincone_transportation')
    op.drop_table('kincone_transportation')