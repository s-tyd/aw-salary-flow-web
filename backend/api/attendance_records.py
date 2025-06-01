from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict
import csv
import io
import re
import logging
from datetime import datetime, timedelta
from decimal import Decimal

from database import get_db
from core.security import get_current_user
from models import User, AttendanceRecord, Employee, CalculationPeriod
from schemas import (
    AttendanceRecordCreate, AttendanceRecordUpdate, AttendanceRecordResponse,
    AttendanceRecordCSVImport, AttendanceRecordImportResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

def parse_csv_date(date_str: str):
    """CSV日付文字列をdateオブジェクトに変換"""
    if not date_str or date_str.strip() == "":
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y/%m/%d").date()
        except ValueError:
            return None

def parse_csv_decimal(amount_str: str):
    """CSV数値文字列をDecimalに変換"""
    if not amount_str or amount_str.strip() == "":
        return Decimal('0')
    try:
        # カンマを除去して数値に変換
        clean_amount = amount_str.replace(',', '')
        return Decimal(clean_amount)
    except (ValueError, TypeError):
        return Decimal('0')

def parse_csv_int(count_str: str):
    """CSV数値文字列をintに変換"""
    if not count_str or count_str.strip() == "":
        return 0
    try:
        return int(count_str)
    except (ValueError, TypeError):
        return 0

def parse_csv_time_to_timedelta(time_str: str):
    """CSV時間文字列（HH:MM形式）をtimedeltaに変換"""
    if not time_str or time_str.strip() == "" or time_str == "-":
        return None
    
    try:
        if ':' in time_str:
            hours, minutes = time_str.split(':')
            return timedelta(hours=int(hours), minutes=int(minutes))
        else:
            # 数値のみの場合は時間として扱う
            return timedelta(hours=float(time_str))
    except (ValueError, TypeError):
        return None

def find_employee_by_number(db: Session, employee_number: str, user_id: int):
    """従業員番号による柔軟な検索"""
    if not employee_number:
        return None
    
    # まず完全一致で検索
    employee = db.query(Employee).filter(
        Employee.employee_number == employee_number,
        Employee.user_id == user_id
    ).first()
    
    if employee:
        return employee
    
    # 数字として解釈できる場合は数値比較
    try:
        csv_number_int = int(employee_number)
        
        # データベースの全従業員を取得して数値比較
        employees = db.query(Employee).filter(Employee.user_id == user_id).all()
        
        for emp in employees:
            try:
                # データベースの従業員番号を数値として解釈
                db_number_int = int(emp.employee_number)
                if csv_number_int == db_number_int:
                    logger.info(f"従業員番号 数値一致: CSV={employee_number}({csv_number_int}) = DB={emp.employee_number}({db_number_int})")
                    return emp
            except (ValueError, TypeError):
                # データベースの従業員番号が数値でない場合は続行
                continue
                
    except (ValueError, TypeError):
        # CSVの従業員番号が数値でない場合は完全一致のみ
        pass
    
    logger.warning(f"従業員番号 {employee_number} に一致する従業員が見つかりませんでした")
    return None

@router.get("/", response_model=List[AttendanceRecordResponse])
def get_attendance_records(
    calculation_period_id: int = None,
    employee_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """勤務データを取得"""
    query = db.query(AttendanceRecord)
    
    if calculation_period_id:
        query = query.filter(AttendanceRecord.calculation_period_id == calculation_period_id)
    
    if employee_id:
        query = query.filter(AttendanceRecord.employee_id == employee_id)
    
    # ユーザーの社員データのみ取得（employee_idがNullの場合も含める）
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).all()
    user_employee_ids_list = [emp.id for emp in user_employee_ids]
    
    # employee_idがNullの場合も含める条件
    query = query.filter(
        (AttendanceRecord.employee_id.in_(user_employee_ids_list)) | 
        (AttendanceRecord.employee_id.is_(None))
    )
    
    records = query.offset(skip).limit(limit).all()
    return records

@router.get("/{record_id}", response_model=AttendanceRecordResponse)
def get_attendance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """特定の勤務データを取得"""
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="勤務データが見つかりません")
    
    # ユーザーの権限チェック
    if record.employee_id:
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    return record

@router.post("/", response_model=AttendanceRecordResponse)
def create_attendance_record(
    record: AttendanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """勤務データを作成"""
    # 計算期間の存在確認
    calc_period = db.query(CalculationPeriod).filter(
        CalculationPeriod.id == record.calculation_period_id
    ).first()
    if not calc_period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    # 社員の存在確認と権限チェック
    if record.employee_id:
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db_record = AttendanceRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=AttendanceRecordResponse)
def update_attendance_record(
    record_id: int,
    record_update: AttendanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """勤務データを更新"""
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="勤務データが見つかりません")
    
    # ユーザーの権限チェック
    if record.employee_id:
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    update_data = record_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}")
def delete_attendance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """勤務データを削除"""
    record = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="勤務データが見つかりません")
    
    # ユーザーの権限チェック
    if record.employee_id:
        employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db.delete(record)
    db.commit()
    return {"message": "勤務データを削除しました"}

@router.delete("/")
def delete_all_attendance_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーの勤務データを全て削除"""
    # ユーザーの社員IDを取得
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).all()
    user_employee_ids_list = [emp.id for emp in user_employee_ids]
    
    # employee_idがNullの場合も含めて削除
    deleted_count = db.query(AttendanceRecord).filter(
        (AttendanceRecord.employee_id.in_(user_employee_ids_list)) | 
        (AttendanceRecord.employee_id.is_(None))
    ).delete(synchronize_session=False)
    
    db.commit()
    logger.info(f"Deleted {deleted_count} attendance records for user {current_user.id}")
    return {"message": f"{deleted_count}件の勤務データを削除しました", "deleted_count": deleted_count}

@router.post("/import-csv", response_model=AttendanceRecordImportResponse)
async def import_attendance_csv(
    calculation_period_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """勤務データのCSVファイルをインポート"""
    
    try:
        logger.info(f"Attendance CSV import started by user {current_user.id} for calculation period {calculation_period_id}")
        logger.info(f"File: {file.filename}, size: {file.size}, content_type: {file.content_type}")
        
        # ファイル拡張子チェック
        if file.filename and not file.filename.lower().endswith('.csv'):
            logger.warning(f"File extension is not .csv: {file.filename}")
        
        # ファイルサイズチェック
        if file.size == 0:
            logger.error("File is empty")
            raise HTTPException(status_code=400, detail="CSVファイルが空です")
        
        # 計算期間の存在確認
        calc_period = db.query(CalculationPeriod).filter(
            CalculationPeriod.id == calculation_period_id
        ).first()
        if not calc_period:
            logger.error(f"Calculation period {calculation_period_id} not found")
            raise HTTPException(status_code=404, detail="計算期間が見つかりません")
        
        # CSVファイルの読み込み
        content = await file.read()
        logger.info(f"File content size: {len(content)} bytes")
        
        # BOMの確認と除去
        if content.startswith(b'\xef\xbb\xbf'):
            content = content[3:]  # UTF-8 BOMを除去
            logger.info("Removed UTF-8 BOM")
        
        # 複数のエンコーディングを試行
        content_str = None
        encodings_to_try = ['utf-8', 'utf-8-sig', 'shift_jis', 'cp932', 'euc-jp', 'iso-2022-jp', 'latin1']
        
        for encoding in encodings_to_try:
            try:
                content_str = content.decode(encoding)
                logger.info(f"Successfully decoded as {encoding}")
                # デコード後の最初の数行をログ出力
                lines = content_str.split('\n')[:3]
                logger.info(f"First few lines: {lines}")
                break
            except UnicodeDecodeError as e:
                logger.warning(f"Failed to decode as {encoding}: {str(e)}")
                continue
        
        if content_str is None:
            logger.error(f"Failed to decode file with all attempted encodings: {encodings_to_try}")
            raise HTTPException(status_code=400, detail="CSVファイルの文字エンコーディングが不正です")
        
        # CSVパース
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        imported_count = 0
        errors = []
        
        logger.info("Starting CSV processing")
        
        for row_num, row in enumerate(csv_reader, start=2):  # ヘッダー行をスキップ
            try:
                logger.debug(f"Processing row {row_num}: {row}")
                
                # 従業員番号と従業員名を取得（列名の日本語/英語両方に対応）
                employee_number = (row.get('従業員番号') or row.get('Employee Number') or '').strip()
                employee_name = (row.get('従業員名') or row.get('Employee Name') or '').strip()
                
                # 従業員番号から社員IDを取得（柔軟な照合）
                employee_id = None
                if employee_number:
                    employee = find_employee_by_number(db, employee_number, current_user.id)
                    if employee:
                        employee_id = employee.id
                
                # 期間情報を取得
                period_start = parse_csv_date(row.get('集計開始日') or row.get('Period Start') or '')
                period_end = parse_csv_date(row.get('集計終了日') or row.get('Period End') or '')
                
                # 勤務時間情報を取得
                work_days = parse_csv_int(row.get('勤務日数') or row.get('Work Days') or '0')
                total_work_time = (row.get('総労働時間') or row.get('Total Work Time') or '').strip()
                regular_work_time = (row.get('所定労働時間') or row.get('Regular Work Time') or '').strip()
                actual_work_time = (row.get('実労働時間') or row.get('Actual Work Time') or '').strip()
                overtime_work_time = (row.get('時間外労働時間') or row.get('Overtime Work Time') or '').strip()
                
                # 有給・休暇情報
                paid_leave_used = parse_csv_decimal(row.get('有給取得日数') or row.get('Paid Leave Used') or '0')
                paid_leave_remaining = parse_csv_decimal(row.get('有給残日数') or row.get('Paid Leave Remaining') or '0')
                
                # 元のCSVデータを保存（デバッグ用）
                raw_data = dict(row)
                
                # AttendanceRecordオブジェクトを作成
                attendance_record = AttendanceRecord(
                    calculation_period_id=calculation_period_id,
                    employee_id=employee_id,
                    employee_number=employee_number,
                    employee_name=employee_name,
                    period_start=period_start,
                    period_end=period_end,
                    work_days=work_days,
                    total_work_time=total_work_time,
                    regular_work_time=regular_work_time,
                    actual_work_time=actual_work_time,
                    overtime_work_time=overtime_work_time,
                    late_night_work_time=(row.get('深夜労働時間') or row.get('Late Night Work Time') or '').strip(),
                    holiday_work_time=(row.get('休日労働時間') or row.get('Holiday Work Time') or '').strip(),
                    paid_leave_used=paid_leave_used,
                    paid_leave_remaining=paid_leave_remaining,
                    absence_days=parse_csv_int(row.get('欠勤日数') or row.get('Absence Days') or '0'),
                    tardiness_count=parse_csv_int(row.get('遅刻回数') or row.get('Tardiness Count') or '0'),
                    early_leave_count=parse_csv_int(row.get('早退回数') or row.get('Early Leave Count') or '0'),
                    data_source='attendance_csv',
                    raw_data=raw_data
                )
                
                db.add(attendance_record)
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Error processing row {row_num}: {str(e)}")
                errors.append(f"行 {row_num}: {str(e)}")
        
        if errors:
            logger.error(f"Attendance CSV import failed with {len(errors)} errors")
            db.rollback()
            return AttendanceRecordImportResponse(
                imported_count=0,
                errors=errors,
                success=False
            )
        
        db.commit()
        logger.info(f"Attendance CSV import completed successfully. Imported {imported_count} records")
        return AttendanceRecordImportResponse(
            imported_count=imported_count,
            errors=[],
            success=True
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during Attendance CSV import: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"CSV インポート中にエラーが発生しました: {str(e)}")