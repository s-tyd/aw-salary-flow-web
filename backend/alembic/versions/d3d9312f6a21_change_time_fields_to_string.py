"""change_time_fields_to_string

Revision ID: d3d9312f6a21
Revises: b22d90e88399
Create Date: 2025-05-31 21:37:36.696820

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import INTERVAL


# revision identifiers, used by Alembic.
revision: str = 'd3d9312f6a21'
down_revision: Union[str, None] = 'b22d90e88399'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # AttendanceRecordの時間フィールドをStringに変更
    op.alter_column('attendance_records', 'total_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'regular_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'actual_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'overtime_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'late_night_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'holiday_work_time',
                    existing_type=INTERVAL(),
                    type_=sa.String(),
                    existing_nullable=True)


def downgrade() -> None:
    # StringからINTERVALに戻す
    op.alter_column('attendance_records', 'holiday_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'late_night_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'overtime_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'actual_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'regular_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
    
    op.alter_column('attendance_records', 'total_work_time',
                    existing_type=sa.String(),
                    type_=INTERVAL(),
                    existing_nullable=True)
