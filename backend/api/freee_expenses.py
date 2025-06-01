from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict
import csv
import io
import re
import logging
from datetime import datetime
from decimal import Decimal

from database import get_db
from core.security import get_current_user
from models import User, FreeeExpense, Employee, CalculationPeriod
from schemas import (
    FreeeExpenseCreate, FreeeExpenseUpdate, FreeeExpenseResponse,
    FreeeExpenseCSVImport, FreeeExpenseImportResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

def extract_employee_number(partner_name: str) -> str:
    """取引先名から社員番号を抽出"""
    if not partner_name:
        return None
    
    # ★100吉村芙実 のような形式から100を抽出
    match = re.match(r'★(\d+)', partner_name)
    if match:
        return match.group(1)
    return None

def parse_csv_date(date_str: str):
    """CSV日付文字列をdateオブジェクトに変換"""
    if not date_str or date_str.strip() == "":
        return None
    try:
        return datetime.strptime(date_str, "%Y/%m/%d").date()
    except ValueError:
        return None

def parse_csv_decimal(amount_str: str):
    """CSV金額文字列をDecimalに変換"""
    if not amount_str or amount_str.strip() == "":
        return Decimal('0')
    try:
        # カンマを除去して数値に変換
        clean_amount = amount_str.replace(',', '')
        return Decimal(clean_amount)
    except (ValueError, TypeError):
        return Decimal('0')

@router.get("/", response_model=List[FreeeExpenseResponse])
def get_freee_expenses(
    calculation_period_id: int = None,
    employee_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Freee経費データを取得"""
    query = db.query(FreeeExpense)
    
    if calculation_period_id:
        query = query.filter(FreeeExpense.calculation_period_id == calculation_period_id)
    
    if employee_id:
        query = query.filter(FreeeExpense.employee_id == employee_id)
    
    # ユーザーの社員データのみ取得
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).subquery()
    query = query.filter(FreeeExpense.employee_id.in_(user_employee_ids))
    
    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.get("/{expense_id}", response_model=FreeeExpenseResponse)
def get_freee_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """特定のFreee経費データを取得"""
    expense = db.query(FreeeExpense).filter(FreeeExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費データが見つかりません")
    
    # ユーザーの権限チェック
    employee = db.query(Employee).filter(Employee.id == expense.employee_id).first()
    if not employee or employee.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    return expense

@router.post("/", response_model=FreeeExpenseResponse)
def create_freee_expense(
    expense: FreeeExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Freee経費データを作成"""
    # 計算期間の存在確認
    calc_period = db.query(CalculationPeriod).filter(
        CalculationPeriod.id == expense.calculation_period_id
    ).first()
    if not calc_period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    # 社員の存在確認と権限チェック
    if expense.employee_id:
        employee = db.query(Employee).filter(Employee.id == expense.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db_expense = FreeeExpense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.put("/{expense_id}", response_model=FreeeExpenseResponse)
def update_freee_expense(
    expense_id: int,
    expense_update: FreeeExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Freee経費データを更新"""
    expense = db.query(FreeeExpense).filter(FreeeExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費データが見つかりません")
    
    # ユーザーの権限チェック
    employee = db.query(Employee).filter(Employee.id == expense.employee_id).first()
    if not employee or employee.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    update_data = expense_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_freee_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Freee経費データを削除"""
    expense = db.query(FreeeExpense).filter(FreeeExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="経費データが見つかりません")
    
    # ユーザーの権限チェック
    employee = db.query(Employee).filter(Employee.id == expense.employee_id).first()
    if not employee or employee.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db.delete(expense)
    db.commit()
    return {"message": "経費データを削除しました"}

@router.delete("/")
def delete_all_freee_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーのFreee経費データを全て削除"""
    # ユーザーの社員IDを取得
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).all()
    user_employee_ids_list = [emp.id for emp in user_employee_ids]
    
    if not user_employee_ids_list:
        return {"message": "削除する経費データがありません", "deleted_count": 0}
    
    # ユーザーの経費データを全て削除
    deleted_count = db.query(FreeeExpense).filter(
        FreeeExpense.employee_id.in_(user_employee_ids_list)
    ).delete(synchronize_session=False)
    
    db.commit()
    logger.info(f"Deleted {deleted_count} Freee expense records for user {current_user.id}")
    return {"message": f"{deleted_count}件の経費データを削除しました", "deleted_count": deleted_count}

@router.post("/import-csv", response_model=FreeeExpenseImportResponse)
async def import_freee_expenses_csv(
    calculation_period_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """FreeeのCSVファイルをインポート"""
    
    try:
        logger.info(f"CSV import started by user {current_user.id} for calculation period {calculation_period_id}")
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
        
        # ファイルの最初の100バイトを確認
        sample_bytes = content[:100]
        logger.info(f"File sample bytes: {sample_bytes}")
        
        # BOMの確認と除去
        if content.startswith(b'\xef\xbb\xbf'):
            content = content[3:]  # UTF-8 BOMを除去
            logger.info("Removed UTF-8 BOM")
        elif content.startswith(b'\xff\xfe'):
            content = content[2:]  # UTF-16LE BOMを除去
            logger.info("Removed UTF-16LE BOM")
        elif content.startswith(b'\xfe\xff'):
            content = content[2:]  # UTF-16BE BOMを除去
            logger.info("Removed UTF-16BE BOM")
        
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
            # 最後の手段として、エラーを無視してUTF-8でデコード
            try:
                content_str = content.decode('utf-8', errors='replace')
                logger.warning("Decoded with UTF-8 using error replacement")
            except Exception as e:
                logger.error(f"Even error-tolerant UTF-8 decoding failed: {str(e)}")
                raise HTTPException(status_code=400, detail="CSVファイルの文字エンコーディングが不正です")
        
        # CSVパース
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        imported_count = 0
        errors = []
        
        logger.info("Starting CSV processing")
        
        for row_num, row in enumerate(csv_reader, start=2):  # ヘッダー行をスキップ
            try:
                logger.debug(f"Processing row {row_num}: {row}")
                # 社員番号を抽出
                partner_name = row.get('取引先', '')
                employee_number = extract_employee_number(partner_name)
                
                # 社員番号から社員IDを取得
                employee_id = None
                if employee_number:
                    employee = db.query(Employee).filter(
                        Employee.employee_number == employee_number,
                        Employee.user_id == current_user.id
                    ).first()
                    if employee:
                        employee_id = employee.id
                
                # FreeeExpenseオブジェクトを作成
                freee_expense = FreeeExpense(
                    calculation_period_id=calculation_period_id,
                    employee_id=employee_id,
                    income_expense_type=row.get('収支区分', ''),
                    management_number=row.get('管理番号', ''),
                    occurrence_date=parse_csv_date(row.get('発生日', '')),
                    payment_due_date=parse_csv_date(row.get('支払期日', '')),
                    partner_name=partner_name,
                    account_item=row.get('勘定科目', ''),
                    tax_classification=row.get('税区分', ''),
                    amount=parse_csv_decimal(row.get('金額', '0')),
                    tax_calculation_type=row.get('税計算区分', ''),
                    tax_amount=parse_csv_decimal(row.get('税額', '0')),
                    notes=row.get('備考', ''),
                    item_name=row.get('品目', ''),
                    department=row.get('部門', ''),
                    memo_tags=row.get('メモタグ（複数指定可、カンマ区切り）', ''),
                    payment_date=parse_csv_date(row.get('支払日', '')),
                    payment_account=row.get('支払口座', ''),
                    payment_amount=parse_csv_decimal(row.get('支払金額', '0')),
                    employee_number=employee_number,
                    data_source='freee_csv'
                )
                
                db.add(freee_expense)
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Error processing row {row_num}: {str(e)}")
                errors.append(f"行 {row_num}: {str(e)}")
        
        if errors:
            logger.error(f"CSV import failed with {len(errors)} errors")
            db.rollback()
            return FreeeExpenseImportResponse(
                imported_count=0,
                errors=errors,
                success=False
            )
        
        db.commit()
        logger.info(f"CSV import completed successfully. Imported {imported_count} records")
        return FreeeExpenseImportResponse(
            imported_count=imported_count,
            errors=[],
            success=True
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during CSV import: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"CSV インポート中にエラーが発生しました: {str(e)}")