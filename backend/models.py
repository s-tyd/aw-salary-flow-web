from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Numeric, Text, LargeBinary, Boolean, JSON, Interval
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    employees = relationship("Employee", back_populates="user")
    created_templates = relationship("ExcelTemplate", back_populates="created_by_user")
    template_usages = relationship("TemplateUsage", back_populates="user")

class CalculationPeriod(Base):
    __tablename__ = "calculation_periods"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)
    period_name = Column(String, nullable=False)  # "2025年1月"
    status = Column(String, default="draft")  # draft, calculating, completed, locked
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    work_data = relationship("WorkData", back_populates="calculation_period")
    transportation_expenses = relationship("TransportationExpense", back_populates="calculation_period")
    kiwigo_reports = relationship("KiwigoReport", back_populates="calculation_period")
    salary_calculations = relationship("SalaryCalculation", back_populates="calculation_period")
    template_usages = relationship("TemplateUsage", back_populates="calculation_period")
    freee_expenses = relationship("FreeeExpense", back_populates="calculation_period")
    kincone_transportation = relationship("KinconeTransportation", back_populates="calculation_period")
    attendance_records = relationship("AttendanceRecord", back_populates="calculation_period")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_number = Column(String, unique=True, index=True)
    name = Column(String)
    hire_date = Column(Date)
    resignation_date = Column(Date)
    kiwi_name = Column(String)
    remote_allowance = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="employees")
    work_data = relationship("WorkData", back_populates="employee")
    transportation_expenses = relationship("TransportationExpense", back_populates="employee")
    kiwigo_reports = relationship("KiwigoReport", back_populates="employee")
    salary_calculations = relationship("SalaryCalculation", back_populates="employee")
    freee_expenses = relationship("FreeeExpense", back_populates="employee")
    kincone_transportation = relationship("KinconeTransportation", back_populates="employee")
    attendance_records = relationship("AttendanceRecord", back_populates="employee")

class WorkData(Base):
    __tablename__ = "work_data"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    work_date = Column(Date)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    break_time = Column(Interval)  # 休憩時間（INTERVAL型）
    overtime_duration = Column(Interval)  # 残業時間（INTERVAL型）
    notes = Column(Text)
    data_source = Column(String, default="manual")  # kincone, manual, import
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="work_data")
    employee = relationship("Employee", back_populates="work_data")


class TransportationExpense(Base):
    __tablename__ = "transportation_expenses"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    usage_date = Column(Date)
    departure = Column(String)  # 出発地
    destination = Column(String)  # 到着地
    purpose = Column(String)  # 用途
    amount = Column(Numeric(10, 2))
    usage_count = Column(Integer, default=1)
    data_source = Column(String, default="manual")  # kincone, manual, import
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="transportation_expenses")
    employee = relationship("Employee", back_populates="transportation_expenses")

class KiwigoReport(Base):
    __tablename__ = "kiwigo_reports"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    report_type = Column(String)  # レポート種別
    score = Column(Numeric(5, 2))  # スコア
    evaluation = Column(String)  # 評価
    report_data = Column(JSON)  # 詳細データ（JSON形式）
    report_file_path = Column(String)  # ファイルパス
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="kiwigo_reports")
    employee = relationship("Employee", back_populates="kiwigo_reports")

class SalaryCalculation(Base):
    __tablename__ = "salary_calculations"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    base_salary = Column(Numeric(10, 2))  # 基本給
    overtime_pay = Column(Numeric(10, 2), default=0)  # 残業代
    transportation_allowance = Column(Numeric(10, 2), default=0)  # 交通費
    remote_allowance = Column(Numeric(10, 2), default=0)  # リモート手当
    total_gross = Column(Numeric(10, 2))  # 総支給額
    deductions = Column(Numeric(10, 2), default=0)  # 控除額
    net_salary = Column(Numeric(10, 2))  # 手取り額
    calculation_details = Column(JSON)  # 計算詳細（JSON）
    status = Column(String, default="draft")  # draft, confirmed, paid
    calculated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="salary_calculations")
    employee = relationship("Employee", back_populates="salary_calculations")

class ExcelTemplate(Base):
    __tablename__ = "excel_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    template_type = Column(String)  # salary, report, analysis
    file_name = Column(String, nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String, default="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    version = Column(String, default="1.0")
    is_active = Column(Boolean, default=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by_user = relationship("User", back_populates="created_templates")
    template_usages = relationship("TemplateUsage", back_populates="excel_template")

class TemplateUsage(Base):
    __tablename__ = "template_usage"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    excel_template_id = Column(Integer, ForeignKey("excel_templates.id"))
    usage_type = Column(String)  # salary, report, analysis
    used_at = Column(DateTime, default=datetime.utcnow)
    used_by_user_id = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="template_usages")
    excel_template = relationship("ExcelTemplate", back_populates="template_usages")
    user = relationship("User", back_populates="template_usages")

# Legacy table for backward compatibility (will be migrated)
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    expense_date = Column(DateTime)
    category = Column(String)
    amount = Column(Numeric(10, 2))
    description = Column(Text)
    receipt_url = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # This table will be migrated to ExpenseRecord

class FreeeExpense(Base):
    __tablename__ = "freee_expenses"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    income_expense_type = Column(String)  # 収支区分
    management_number = Column(String)  # 管理番号
    occurrence_date = Column(Date)  # 発生日
    payment_due_date = Column(Date)  # 支払期日
    partner_name = Column(String)  # 取引先（★社員番号社員名）
    account_item = Column(String)  # 勘定科目
    tax_classification = Column(String)  # 税区分
    amount = Column(Numeric(10, 2))  # 金額
    tax_calculation_type = Column(String)  # 税計算区分
    tax_amount = Column(Numeric(10, 2))  # 税額
    notes = Column(Text)  # 備考
    item_name = Column(String)  # 品目
    department = Column(String)  # 部門
    memo_tags = Column(String)  # メモタグ
    payment_date = Column(Date)  # 支払日
    payment_account = Column(String)  # 支払口座
    payment_amount = Column(Numeric(10, 2))  # 支払金額
    employee_number = Column(String)  # 社員番号（取引先から抽出）
    data_source = Column(String, default="freee_csv")  # データソース
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="freee_expenses")
    employee = relationship("Employee", back_populates="freee_expenses")

class KinconeTransportation(Base):
    __tablename__ = "kincone_transportation"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee_number = Column(String)  # 社員番号
    employee_name = Column(String)  # 社員名
    usage_date = Column(Date)  # 利用日
    departure = Column(String)  # 出発地
    destination = Column(String)  # 到着地
    transportation_type = Column(String)  # 交通手段
    amount = Column(Numeric(10, 2))  # 金額
    usage_count = Column(Integer, default=1)  # 利用回数
    route_info = Column(Text)  # 経路情報
    purpose = Column(String)  # 利用目的
    approval_status = Column(String, default="pending")  # pending, approved, rejected
    data_source = Column(String, default="kincone_csv")  # データソース
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="kincone_transportation")
    employee = relationship("Employee", back_populates="kincone_transportation")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    calculation_period_id = Column(Integer, ForeignKey("calculation_periods.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    employee_number = Column(String)  # 社員番号
    employee_name = Column(String)  # 社員名
    period_start = Column(Date)  # 集計開始日
    period_end = Column(Date)  # 集計終了日
    work_days = Column(Integer)  # 勤務日数
    total_work_time = Column(String)  # 総労働時間（HH:MM形式）
    regular_work_time = Column(String)  # 所定労働時間（HH:MM形式）
    actual_work_time = Column(String)  # 実労働時間（HH:MM形式）
    overtime_work_time = Column(String)  # 時間外労働時間（HH:MM形式）
    late_night_work_time = Column(String)  # 深夜労働時間（HH:MM形式）
    holiday_work_time = Column(String)  # 休日労働時間（HH:MM形式）
    paid_leave_used = Column(Numeric(5, 3))  # 有給取得日数
    paid_leave_remaining = Column(Numeric(5, 3))  # 有給残日数
    absence_days = Column(Integer, default=0)  # 欠勤日数
    tardiness_count = Column(Integer, default=0)  # 遅刻回数
    early_leave_count = Column(Integer, default=0)  # 早退回数
    data_source = Column(String, default="attendance_csv")  # データソース
    raw_data = Column(JSON)  # 元のCSVデータを保存
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calculation_period = relationship("CalculationPeriod", back_populates="attendance_records")
    employee = relationship("Employee", back_populates="attendance_records")