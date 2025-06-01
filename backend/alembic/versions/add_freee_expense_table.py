"""add_freee_expense_table

Revision ID: freee_expense_001
Revises: fb97019cfa0c
Create Date: 2025-05-31 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'freee_expense_001'
down_revision = 'c607a9976da4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create freee_expenses table
    op.create_table('freee_expenses',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('calculation_period_id', sa.Integer(), nullable=True),
    sa.Column('employee_id', sa.Integer(), nullable=True),
    sa.Column('income_expense_type', sa.String(), nullable=True),
    sa.Column('management_number', sa.String(), nullable=True),
    sa.Column('occurrence_date', sa.Date(), nullable=True),
    sa.Column('payment_due_date', sa.Date(), nullable=True),
    sa.Column('partner_name', sa.String(), nullable=True),
    sa.Column('account_item', sa.String(), nullable=True),
    sa.Column('tax_classification', sa.String(), nullable=True),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('tax_calculation_type', sa.String(), nullable=True),
    sa.Column('tax_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('item_name', sa.String(), nullable=True),
    sa.Column('department', sa.String(), nullable=True),
    sa.Column('memo_tags', sa.String(), nullable=True),
    sa.Column('payment_date', sa.Date(), nullable=True),
    sa.Column('payment_account', sa.String(), nullable=True),
    sa.Column('payment_amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('employee_number', sa.String(), nullable=True),
    sa.Column('data_source', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['calculation_period_id'], ['calculation_periods.id'], ),
    sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_freee_expenses_id'), 'freee_expenses', ['id'], unique=False)


def downgrade() -> None:
    # Drop freee_expenses table
    op.drop_index(op.f('ix_freee_expenses_id'), table_name='freee_expenses')
    op.drop_table('freee_expenses')