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
from models import User, KinconeTransportation, Employee, CalculationPeriod
from schemas import (
    KinconeTransportationCreate, KinconeTransportationUpdate, KinconeTransportationResponse,
    KinconeTransportationCSVImport, KinconeTransportationImportResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

def parse_csv_date(date_str: str):
    """CSV日付文字列をdateオブジェクトに変換"""
    if not date_str or date_str.strip() == "":
        return None
    try:
        return datetime.strptime(date_str, "%Y/%m/%d").date()
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None

def parse_csv_decimal(amount_str: str):
    """CSV金額文字列をDecimalに変換"""
    if not amount_str or amount_str.strip() == "":
        return Decimal('0')
    try:
        # カンマを除去して数値に変換
        clean_amount = amount_str.replace(',', '').replace('円', '')
        return Decimal(clean_amount)
    except (ValueError, TypeError):
        return Decimal('0')

def parse_csv_int(count_str: str):
    """CSV数値文字列をintに変換"""
    if not count_str or count_str.strip() == "":
        return 1
    try:
        return int(count_str)
    except (ValueError, TypeError):
        return 1

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

@router.get("/", response_model=List[KinconeTransportationResponse])
def get_kincone_transportation(
    calculation_period_id: int = None,
    employee_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kincone交通費データを取得"""
    query = db.query(KinconeTransportation)
    
    if calculation_period_id:
        query = query.filter(KinconeTransportation.calculation_period_id == calculation_period_id)
    
    if employee_id:
        query = query.filter(KinconeTransportation.employee_id == employee_id)
    
    # ユーザーの社員データのみ取得（employee_idがNullの場合も含める）
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).all()
    user_employee_ids_list = [emp.id for emp in user_employee_ids]
    
    # employee_idがNullの場合も含める条件
    query = query.filter(
        (KinconeTransportation.employee_id.in_(user_employee_ids_list)) | 
        (KinconeTransportation.employee_id.is_(None))
    )
    
    transportation = query.offset(skip).limit(limit).all()
    return transportation

@router.get("/{transportation_id}", response_model=KinconeTransportationResponse)
def get_kincone_transportation_item(
    transportation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """特定のKincone交通費データを取得"""
    transportation = db.query(KinconeTransportation).filter(KinconeTransportation.id == transportation_id).first()
    if not transportation:
        raise HTTPException(status_code=404, detail="交通費データが見つかりません")
    
    # ユーザーの権限チェック
    if transportation.employee_id:
        employee = db.query(Employee).filter(Employee.id == transportation.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    return transportation

@router.post("/", response_model=KinconeTransportationResponse)
def create_kincone_transportation(
    transportation: KinconeTransportationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kincone交通費データを作成"""
    # 計算期間の存在確認
    calc_period = db.query(CalculationPeriod).filter(
        CalculationPeriod.id == transportation.calculation_period_id
    ).first()
    if not calc_period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    # 社員の存在確認と権限チェック
    if transportation.employee_id:
        employee = db.query(Employee).filter(Employee.id == transportation.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db_transportation = KinconeTransportation(**transportation.dict())
    db.add(db_transportation)
    db.commit()
    db.refresh(db_transportation)
    return db_transportation

@router.put("/{transportation_id}", response_model=KinconeTransportationResponse)
def update_kincone_transportation(
    transportation_id: int,
    transportation_update: KinconeTransportationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kincone交通費データを更新"""
    transportation = db.query(KinconeTransportation).filter(KinconeTransportation.id == transportation_id).first()
    if not transportation:
        raise HTTPException(status_code=404, detail="交通費データが見つかりません")
    
    # ユーザーの権限チェック
    if transportation.employee_id:
        employee = db.query(Employee).filter(Employee.id == transportation.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    update_data = transportation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transportation, field, value)
    
    db.commit()
    db.refresh(transportation)
    return transportation

@router.delete("/{transportation_id}")
def delete_kincone_transportation(
    transportation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kincone交通費データを削除"""
    transportation = db.query(KinconeTransportation).filter(KinconeTransportation.id == transportation_id).first()
    if not transportation:
        raise HTTPException(status_code=404, detail="交通費データが見つかりません")
    
    # ユーザーの権限チェック
    if transportation.employee_id:
        employee = db.query(Employee).filter(Employee.id == transportation.employee_id).first()
        if not employee or employee.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    db.delete(transportation)
    db.commit()
    return {"message": "交通費データを削除しました"}

@router.delete("/")
def delete_all_kincone_transportation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """現在のユーザーのKincone交通費データを全て削除"""
    # ユーザーの社員IDを取得
    user_employee_ids = db.query(Employee.id).filter(Employee.user_id == current_user.id).all()
    user_employee_ids_list = [emp.id for emp in user_employee_ids]
    
    # employee_idがNullの場合も含めて削除（インポート時にemployee_idがNullの場合があるため）
    deleted_count = db.query(KinconeTransportation).filter(
        (KinconeTransportation.employee_id.in_(user_employee_ids_list)) | 
        (KinconeTransportation.employee_id.is_(None))
    ).delete(synchronize_session=False)
    
    db.commit()
    logger.info(f"Deleted {deleted_count} Kincone transportation records for user {current_user.id}")
    return {"message": f"{deleted_count}件の交通費データを削除しました", "deleted_count": deleted_count}

@router.post("/import-csv", response_model=KinconeTransportationImportResponse)
async def import_kincone_transportation_csv(
    calculation_period_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """KinconeのCSVファイルをインポート"""
    
    try:
        logger.info(f"Kincone Transportation CSV import started by user {current_user.id} for calculation period {calculation_period_id}")
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
                
                # 従業員番号と従業員名を取得
                employee_number = row.get('従業員番号', '').strip()
                employee_name = row.get('従業員名', '').strip()
                
                # 従業員番号から社員IDを取得（柔軟な照合）
                employee_id = None
                if employee_number:
                    employee = find_employee_by_number(db, employee_number, current_user.id)
                    if employee:
                        employee_id = employee.id
                
                # 金額情報を取得
                transportation_fee = parse_csv_decimal(row.get('交通費', '0'))
                commuting_fee = parse_csv_decimal(row.get('通勤費', '0'))
                total_amount = parse_csv_decimal(row.get('総額', '0'))
                
                # 期間情報を取得
                start_date = parse_csv_date(row.get('集計開始日', ''))
                end_date = parse_csv_date(row.get('集計終了日', ''))
                
                # KinconeTransportationオブジェクトを作成
                kincone_transportation = KinconeTransportation(
                    calculation_period_id=calculation_period_id,
                    employee_id=employee_id,
                    employee_number=employee_number,
                    employee_name=employee_name,
                    usage_date=start_date,  # 集計開始日を使用日として使用
                    departure='',  # CSVに含まれていない
                    destination='',  # CSVに含まれていない
                    transportation_type='',  # CSVに含まれていない
                    amount=total_amount,  # 総額を金額として使用
                    usage_count=parse_csv_int(row.get('利用件数', '1')),
                    route_info=f'交通費: {transportation_fee}円, 通勤費: {commuting_fee}円',  # 詳細情報として保存
                    purpose=f'{start_date} - {end_date}' if start_date and end_date else '',  # 期間を目的として保存
                    approval_status="pending",
                    data_source='kincone_csv'
                )
                
                db.add(kincone_transportation)
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Error processing row {row_num}: {str(e)}")
                errors.append(f"行 {row_num}: {str(e)}")
        
        if errors:
            logger.error(f"Kincone Transportation CSV import failed with {len(errors)} errors")
            db.rollback()
            return KinconeTransportationImportResponse(
                imported_count=0,
                errors=errors,
                success=False
            )
        
        db.commit()
        logger.info(f"Kincone Transportation CSV import completed successfully. Imported {imported_count} records")
        return KinconeTransportationImportResponse(
            imported_count=imported_count,
            errors=[],
            success=True
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during Kincone Transportation CSV import: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"CSV インポート中にエラーが発生しました: {str(e)}")