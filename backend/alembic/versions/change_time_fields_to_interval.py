"""change time fields to interval

Revision ID: time_interval_001
Revises: fb97019cfa0c
Create Date: 2025-01-31 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'time_interval_001'
down_revision = 'fb97019cfa0c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # WorkDataテーブルの時間フィールドをINTERVAL型に変更
    # break_time_minutes (Integer) → break_time (Interval)
    op.execute("""
        ALTER TABLE work_data 
        ADD COLUMN break_time INTERVAL
    """)
    
    op.execute("""
        UPDATE work_data 
        SET break_time = (break_time_minutes * INTERVAL '1 minute')
        WHERE break_time_minutes IS NOT NULL
    """)
    
    op.execute("""
        ALTER TABLE work_data 
        DROP COLUMN break_time_minutes
    """)
    
    # overtime_hours (Numeric) → overtime_duration (Interval)
    op.execute("""
        ALTER TABLE work_data 
        ADD COLUMN overtime_duration INTERVAL
    """)
    
    op.execute("""
        UPDATE work_data 
        SET overtime_duration = (overtime_hours * INTERVAL '1 hour')
        WHERE overtime_hours IS NOT NULL AND overtime_hours > 0
    """)
    
    op.execute("""
        ALTER TABLE work_data 
        DROP COLUMN overtime_hours
    """)
    
    # AttendanceRecordテーブルの既存のString型時間フィールドをINTERVAL型に変更
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN total_work_time TYPE INTERVAL 
        USING CASE 
            WHEN total_work_time IS NULL OR total_work_time = '' THEN NULL
            WHEN total_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(total_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(total_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN regular_work_time TYPE INTERVAL 
        USING CASE 
            WHEN regular_work_time IS NULL OR regular_work_time = '' THEN NULL
            WHEN regular_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(regular_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(regular_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN actual_work_time TYPE INTERVAL 
        USING CASE 
            WHEN actual_work_time IS NULL OR actual_work_time = '' THEN NULL
            WHEN actual_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(actual_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(actual_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN overtime_work_time TYPE INTERVAL 
        USING CASE 
            WHEN overtime_work_time IS NULL OR overtime_work_time = '' THEN NULL
            WHEN overtime_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(overtime_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(overtime_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN late_night_work_time TYPE INTERVAL 
        USING CASE 
            WHEN late_night_work_time IS NULL OR late_night_work_time = '' THEN NULL
            WHEN late_night_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(late_night_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(late_night_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN holiday_work_time TYPE INTERVAL 
        USING CASE 
            WHEN holiday_work_time IS NULL OR holiday_work_time = '' THEN NULL
            WHEN holiday_work_time ~ '^[0-9]+:[0-9]+$' THEN 
                (SPLIT_PART(holiday_work_time, ':', 1)::int * INTERVAL '1 hour' + 
                 SPLIT_PART(holiday_work_time, ':', 2)::int * INTERVAL '1 minute')
            ELSE NULL
        END
    """)


def downgrade() -> None:
    # WorkDataテーブルをINTERVAL型から元の型に戻す
    # break_time (Interval) → break_time_minutes (Integer)
    op.execute("""
        ALTER TABLE work_data 
        ADD COLUMN break_time_minutes INTEGER DEFAULT 0
    """)
    
    op.execute("""
        UPDATE work_data 
        SET break_time_minutes = EXTRACT(EPOCH FROM break_time) / 60
        WHERE break_time IS NOT NULL
    """)
    
    op.execute("""
        ALTER TABLE work_data 
        DROP COLUMN break_time
    """)
    
    # overtime_duration (Interval) → overtime_hours (Numeric)
    op.execute("""
        ALTER TABLE work_data 
        ADD COLUMN overtime_hours NUMERIC(4,2) DEFAULT 0
    """)
    
    op.execute("""
        UPDATE work_data 
        SET overtime_hours = EXTRACT(EPOCH FROM overtime_duration) / 3600
        WHERE overtime_duration IS NOT NULL
    """)
    
    op.execute("""
        ALTER TABLE work_data 
        DROP COLUMN overtime_duration
    """)
    
    # AttendanceRecordテーブルをINTERVAL型からString型に戻す
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN total_work_time TYPE VARCHAR 
        USING CASE 
            WHEN total_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM total_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM total_work_time)::text, 2, '0')
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN regular_work_time TYPE VARCHAR 
        USING CASE 
            WHEN regular_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM regular_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM regular_work_time)::text, 2, '0')
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN actual_work_time TYPE VARCHAR 
        USING CASE 
            WHEN actual_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM actual_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM actual_work_time)::text, 2, '0')
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN overtime_work_time TYPE VARCHAR 
        USING CASE 
            WHEN overtime_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM overtime_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM overtime_work_time)::text, 2, '0')
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN late_night_work_time TYPE VARCHAR 
        USING CASE 
            WHEN late_night_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM late_night_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM late_night_work_time)::text, 2, '0')
        END
    """)
    
    op.execute("""
        ALTER TABLE attendance_records 
        ALTER COLUMN holiday_work_time TYPE VARCHAR 
        USING CASE 
            WHEN holiday_work_time IS NULL THEN NULL
            ELSE EXTRACT(HOURS FROM holiday_work_time)::text || ':' || 
                 LPAD(EXTRACT(MINUTES FROM holiday_work_time)::text, 2, '0')
        END
    """)