from pydantic import BaseModel, EmailStr
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any

# ユーザー関連
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 認証関連
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# 計算期間関連
class CalculationPeriodBase(BaseModel):
    year: int
    month: int
    period_name: str
    status: str = "draft"

class CalculationPeriodCreate(CalculationPeriodBase):
    pass

class CalculationPeriodUpdate(BaseModel):
    status: Optional[str] = None

class CalculationPeriodResponse(CalculationPeriodBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 社員関連
class EmployeeBase(BaseModel):
    employee_number: str
    name: str
    hire_date: Optional[date] = None
    resignation_date: Optional[date] = None
    kiwi_name: Optional[str] = None
    remote_allowance: bool = False
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    employee_number: Optional[str] = None
    name: Optional[str] = None
    hire_date: Optional[date] = None
    resignation_date: Optional[date] = None
    kincone_name: Optional[str] = None
    freee_name: Optional[str] = None
    kiwi_name: Optional[str] = None
    remote_allowance: Optional[bool] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 勤務データ関連
class WorkDataBase(BaseModel):
    work_date: date
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    break_time: Optional[timedelta] = None
    overtime_duration: Optional[timedelta] = None
    notes: Optional[str] = None
    data_source: str = "manual"

class WorkDataCreate(WorkDataBase):
    calculation_period_id: int
    employee_id: int

class WorkDataUpdate(BaseModel):
    work_date: Optional[date] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    break_time: Optional[timedelta] = None
    overtime_duration: Optional[timedelta] = None
    notes: Optional[str] = None
    data_source: Optional[str] = None

class WorkDataResponse(WorkDataBase):
    id: int
    calculation_period_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# 交通費関連
class TransportationExpenseBase(BaseModel):
    usage_date: date
    departure: str
    destination: str
    purpose: Optional[str] = None
    amount: Decimal
    usage_count: int = 1
    data_source: str = "manual"

class TransportationExpenseCreate(TransportationExpenseBase):
    calculation_period_id: int
    employee_id: int

class TransportationExpenseUpdate(BaseModel):
    usage_date: Optional[date] = None
    departure: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    amount: Optional[Decimal] = None
    usage_count: Optional[int] = None
    data_source: Optional[str] = None

class TransportationExpenseResponse(TransportationExpenseBase):
    id: int
    calculation_period_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Kiwigoレポート関連
class KiwigoReportBase(BaseModel):
    report_type: str
    score: Optional[Decimal] = None
    evaluation: Optional[str] = None
    report_data: Optional[Dict[str, Any]] = None
    report_file_path: Optional[str] = None

class KiwigoReportCreate(KiwigoReportBase):
    calculation_period_id: int
    employee_id: int

class KiwigoReportUpdate(BaseModel):
    report_type: Optional[str] = None
    score: Optional[Decimal] = None
    evaluation: Optional[str] = None
    report_data: Optional[Dict[str, Any]] = None
    report_file_path: Optional[str] = None

class KiwigoReportResponse(KiwigoReportBase):
    id: int
    calculation_period_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 給与計算関連
class SalaryCalculationBase(BaseModel):
    base_salary: Decimal
    overtime_pay: Decimal = 0
    transportation_allowance: Decimal = 0
    remote_allowance: Decimal = 0
    total_gross: Decimal
    deductions: Decimal = 0
    net_salary: Decimal
    calculation_details: Optional[Dict[str, Any]] = None
    status: str = "draft"

class SalaryCalculationCreate(SalaryCalculationBase):
    calculation_period_id: int
    employee_id: int

class SalaryCalculationUpdate(BaseModel):
    base_salary: Optional[Decimal] = None
    overtime_pay: Optional[Decimal] = None
    transportation_allowance: Optional[Decimal] = None
    remote_allowance: Optional[Decimal] = None
    total_gross: Optional[Decimal] = None
    deductions: Optional[Decimal] = None
    net_salary: Optional[Decimal] = None
    calculation_details: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class SalaryCalculationResponse(SalaryCalculationBase):
    id: int
    calculation_period_id: int
    employee_id: int
    calculated_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Excelテンプレート関連
class ExcelTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: Optional[str] = None
    version: str = "1.0"
    is_active: bool = True

class ExcelTemplateCreate(ExcelTemplateBase):
    pass

class ExcelTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    template_type: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None

class ExcelTemplateResponse(ExcelTemplateBase):
    id: int
    file_name: str
    file_size: Optional[int] = None
    mime_type: str
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExcelTemplateListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    template_type: Optional[str] = None
    file_name: str
    file_size: Optional[int] = None
    version: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# テンプレート使用履歴関連
class TemplateUsageBase(BaseModel):
    usage_type: str
    notes: Optional[str] = None

class TemplateUsageCreate(TemplateUsageBase):
    calculation_period_id: int
    excel_template_id: int

class TemplateUsageResponse(TemplateUsageBase):
    id: int
    calculation_period_id: int
    excel_template_id: int
    used_at: datetime
    used_by_user_id: int

    class Config:
        from_attributes = True

# Freee経費関連
class FreeeExpenseBase(BaseModel):
    income_expense_type: str  # 収支区分
    management_number: Optional[str] = None  # 管理番号
    occurrence_date: Optional[date] = None  # 発生日
    payment_due_date: Optional[date] = None  # 支払期日
    partner_name: str  # 取引先
    account_item: str  # 勘定科目
    tax_classification: str  # 税区分
    amount: Decimal  # 金額
    tax_calculation_type: str  # 税計算区分
    tax_amount: Decimal  # 税額
    notes: Optional[str] = None  # 備考
    item_name: Optional[str] = None  # 品目
    department: Optional[str] = None  # 部門
    memo_tags: Optional[str] = None  # メモタグ
    payment_date: Optional[date] = None  # 支払日
    payment_account: Optional[str] = None  # 支払口座
    payment_amount: Optional[Decimal] = None  # 支払金額
    employee_number: Optional[str] = None  # 社員番号
    data_source: str = "freee_csv"

class FreeeExpenseCreate(FreeeExpenseBase):
    calculation_period_id: int
    employee_id: Optional[int] = None

class FreeeExpenseUpdate(BaseModel):
    income_expense_type: Optional[str] = None
    management_number: Optional[str] = None
    occurrence_date: Optional[date] = None
    payment_due_date: Optional[date] = None
    partner_name: Optional[str] = None
    account_item: Optional[str] = None
    tax_classification: Optional[str] = None
    amount: Optional[Decimal] = None
    tax_calculation_type: Optional[str] = None
    tax_amount: Optional[Decimal] = None
    notes: Optional[str] = None
    item_name: Optional[str] = None
    department: Optional[str] = None
    memo_tags: Optional[str] = None
    payment_date: Optional[date] = None
    payment_account: Optional[str] = None
    payment_amount: Optional[Decimal] = None
    employee_number: Optional[str] = None

class FreeeExpenseResponse(FreeeExpenseBase):
    id: int
    calculation_period_id: int
    employee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# CSVインポート用のスキーマ
class FreeeExpenseCSVImport(BaseModel):
    calculation_period_id: int
    csv_data: List[Dict[str, str]]

class FreeeExpenseImportResponse(BaseModel):
    imported_count: int
    errors: List[str]
    success: bool

# 古いスキーマ（後方互換性のため保持）
class ExpenseBase(BaseModel):
    expense_date: datetime
    category: str
    amount: Decimal
    description: str
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    employee_id: int

class ExpenseResponse(ExpenseBase):
    id: int
    employee_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Kincone交通費関連
class KinconeTransportationBase(BaseModel):
    employee_number: str  # 社員番号
    employee_name: str  # 社員名
    usage_date: date  # 利用日
    departure: str  # 出発地
    destination: str  # 到着地
    transportation_type: Optional[str] = None  # 交通手段
    amount: Decimal  # 金額
    usage_count: int = 1  # 利用回数
    route_info: Optional[str] = None  # 経路情報
    purpose: Optional[str] = None  # 利用目的
    approval_status: str = "pending"  # 承認状況
    data_source: str = "kincone_csv"

class KinconeTransportationCreate(KinconeTransportationBase):
    calculation_period_id: int
    employee_id: Optional[int] = None

class KinconeTransportationUpdate(BaseModel):
    employee_number: Optional[str] = None
    employee_name: Optional[str] = None
    usage_date: Optional[date] = None
    departure: Optional[str] = None
    destination: Optional[str] = None
    transportation_type: Optional[str] = None
    amount: Optional[Decimal] = None
    usage_count: Optional[int] = None
    route_info: Optional[str] = None
    purpose: Optional[str] = None
    approval_status: Optional[str] = None

class KinconeTransportationResponse(KinconeTransportationBase):
    id: int
    calculation_period_id: int
    employee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# CSVインポート用のスキーマ
class KinconeTransportationCSVImport(BaseModel):
    calculation_period_id: int
    csv_data: List[Dict[str, str]]

class KinconeTransportationImportResponse(BaseModel):
    imported_count: int
    errors: List[str]
    success: bool

# 勤務データスキーマ
class AttendanceRecordBase(BaseModel):
    employee_number: str  # 社員番号
    employee_name: str  # 社員名
    period_start: Optional[date] = None  # 集計開始日
    period_end: Optional[date] = None  # 集計終了日
    work_days: Optional[int] = None  # 勤務日数
    total_work_time: Optional[timedelta] = None  # 総労働時間
    regular_work_time: Optional[timedelta] = None  # 所定労働時間
    actual_work_time: Optional[timedelta] = None  # 実労働時間
    overtime_work_time: Optional[timedelta] = None  # 時間外労働時間
    late_night_work_time: Optional[timedelta] = None  # 深夜労働時間
    holiday_work_time: Optional[timedelta] = None  # 休日労働時間
    paid_leave_used: Optional[Decimal] = None  # 有給取得日数
    paid_leave_remaining: Optional[Decimal] = None  # 有給残日数
    absence_days: Optional[int] = 0  # 欠勤日数
    tardiness_count: Optional[int] = 0  # 遅刻回数
    early_leave_count: Optional[int] = 0  # 早退回数
    data_source: str = "attendance_csv"
    raw_data: Optional[Dict[str, Any]] = None  # 元のCSVデータ

class AttendanceRecordCreate(AttendanceRecordBase):
    calculation_period_id: int
    employee_id: Optional[int] = None

class AttendanceRecordUpdate(BaseModel):
    employee_number: Optional[str] = None
    employee_name: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    work_days: Optional[int] = None
    total_work_time: Optional[timedelta] = None
    regular_work_time: Optional[timedelta] = None
    actual_work_time: Optional[timedelta] = None
    overtime_work_time: Optional[timedelta] = None
    late_night_work_time: Optional[timedelta] = None
    holiday_work_time: Optional[timedelta] = None
    paid_leave_used: Optional[Decimal] = None
    paid_leave_remaining: Optional[Decimal] = None
    absence_days: Optional[int] = None
    tardiness_count: Optional[int] = None
    early_leave_count: Optional[int] = None

class AttendanceRecordResponse(AttendanceRecordBase):
    id: int
    calculation_period_id: int
    employee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# CSVインポート用のスキーマ
class AttendanceRecordCSVImport(BaseModel):
    calculation_period_id: int
    csv_data: List[Dict[str, str]]

class AttendanceRecordImportResponse(BaseModel):
    imported_count: int
    errors: List[str]
    success: bool

# エラーレスポンス
class ApiError(BaseModel):
    detail: str

# 給与計算Excel生成関連
class PayrollGenerationRequest(BaseModel):
    calculation_period_id: int
    template_id: int

class PayrollGenerationResponse(BaseModel):
    status: str
    messages: List[str] = []
    file_name: Optional[str] = None
    download_url: Optional[str] = None

# 勤務データ統合用
class WorkDataSummary(BaseModel):
    employee_id: int
    employee_number: str
    employee_name: str
    working_days: Optional[int] = None
    total_work_hours: Optional[str] = None  # HH:MM形式の文字列
    paid_leave_days: Optional[float] = None
    statutory_holiday_hours: Optional[str] = None  # HH:MM形式の文字列
    night_working_hours: Optional[str] = None  # HH:MM形式の文字列
    absence_days: Optional[int] = None
    remote_count: Optional[int] = None
    lunch_count: Optional[int] = None
    office_count: Optional[int] = None
    event_count: Optional[int] = None
    trip_night_before_count: Optional[int] = None
    trip_count: Optional[int] = None
    travel_onday_count: Optional[int] = None
    travel_holidays_count: Optional[int] = None
    special_holiday: Optional[int] = None
    special_holiday_without_pay: Optional[int] = None
    kiwi_points: Optional[int] = None
    freee_expenses: Optional[int] = None
    kincone_expenses: Optional[int] = None
    no_remote_allowance_limit: bool = False