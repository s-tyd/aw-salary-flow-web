from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, CalculationPeriod
from schemas import CalculationPeriodCreate, CalculationPeriodUpdate, CalculationPeriodResponse
from core.security import get_current_user

router = APIRouter()

@router.get("/calculation-periods", response_model=List[CalculationPeriodResponse])
async def get_calculation_periods(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """計算期間一覧を取得"""
    periods = db.query(CalculationPeriod).order_by(CalculationPeriod.year.desc(), CalculationPeriod.month.desc()).all()
    return periods

@router.get("/calculation-periods/{period_id}", response_model=CalculationPeriodResponse)
async def get_calculation_period(period_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """指定された計算期間の詳細を取得"""
    period = db.query(CalculationPeriod).filter(CalculationPeriod.id == period_id).first()
    
    if not period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    return period

@router.post("/calculation-periods", response_model=CalculationPeriodResponse)
async def create_calculation_period(period_data: CalculationPeriodCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """新しい計算期間を作成"""
    # 同じ年月の期間が既に存在するかチェック
    existing_period = db.query(CalculationPeriod).filter(
        CalculationPeriod.year == period_data.year,
        CalculationPeriod.month == period_data.month
    ).first()
    
    if existing_period:
        raise HTTPException(status_code=400, detail="この年月の計算期間は既に存在します")
    
    # 計算期間作成
    db_period = CalculationPeriod(
        year=period_data.year,
        month=period_data.month,
        period_name=period_data.period_name,
        status=period_data.status
    )
    
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    
    return db_period

@router.put("/calculation-periods/{period_id}", response_model=CalculationPeriodResponse)
async def update_calculation_period(
    period_id: int,
    period_data: CalculationPeriodUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """計算期間を更新"""
    period = db.query(CalculationPeriod).filter(CalculationPeriod.id == period_id).first()
    
    if not period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    # ステータス更新
    if period_data.status:
        period.status = period_data.status
        period.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(period)
    
    return period

@router.delete("/calculation-periods/{period_id}")
async def delete_calculation_period(period_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """計算期間を削除"""
    period = db.query(CalculationPeriod).filter(CalculationPeriod.id == period_id).first()
    
    if not period:
        raise HTTPException(status_code=404, detail="計算期間が見つかりません")
    
    # ドラフト状態の場合のみ削除可能
    if period.status != "draft":
        raise HTTPException(status_code=400, detail="ドラフト状態の計算期間のみ削除できます")
    
    db.delete(period)
    db.commit()
    
    return {"message": "計算期間が削除されました"}

@router.get("/calculation-periods-current", response_model=CalculationPeriodResponse)
async def get_current_calculation_period(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """現在の計算期間を取得（自動作成なし）"""
    current_date = datetime.now()
    
    # 現在の年月の期間を探す
    period = db.query(CalculationPeriod).filter(
        CalculationPeriod.year == current_date.year,
        CalculationPeriod.month == current_date.month
    ).first()
    
    if not period:
        raise HTTPException(status_code=404, detail="現在の年月の計算期間が見つかりません")
    
    return period

@router.get("/calculation-periods/check/{year}/{month}")
async def check_calculation_period_exists(
    year: int, 
    month: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """指定年月の計算期間が存在するかチェック"""
    period = db.query(CalculationPeriod).filter(
        CalculationPeriod.year == year,
        CalculationPeriod.month == month
    ).first()
    
    return {
        "exists": period is not None,
        "status": period.status if period else None,
        "can_start_calculation": period is None or period.status == "draft"
    }

@router.post("/calculation-periods/start/{year}/{month}", response_model=CalculationPeriodResponse)
async def start_salary_calculation(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """指定年月の給与計算を開始"""
    # 既存の期間をチェック
    existing_period = db.query(CalculationPeriod).filter(
        CalculationPeriod.year == year,
        CalculationPeriod.month == month
    ).first()
    
    if existing_period:
        if existing_period.status == "completed":
            raise HTTPException(status_code=400, detail="この期間の計算は既に完了しています")
        elif existing_period.status == "calculating":
            raise HTTPException(status_code=400, detail="この期間の計算は既に開始されています")
        elif existing_period.status == "locked":
            raise HTTPException(status_code=400, detail="この期間の計算はロックされています")
        else:
            # ドラフト状態の場合は計算開始に変更
            existing_period.status = "calculating"
            existing_period.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_period)
            return existing_period
    else:
        # 新しい計算期間を作成して計算開始
        period_name = f"{year}年{month}月"
        new_period = CalculationPeriod(
            year=year,
            month=month,
            period_name=period_name,
            status="calculating"
        )
        db.add(new_period)
        db.commit()
        db.refresh(new_period)
        return new_period