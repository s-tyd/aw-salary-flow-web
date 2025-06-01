from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from models import User, Employee

def get_user_employee(db: Session, user: User) -> Employee:
    """ユーザーの最初の従業員を取得（簡素化版）"""
    employee = db.query(Employee).filter(Employee.user_id == user.id).first()
    if not employee:
        raise HTTPException(status_code=400, detail="従業員情報が見つかりません")
    return employee

def get_user_employee_optional(db: Session, user: User) -> Optional[Employee]:
    """ユーザーの最初の従業員を取得（Optional版）"""
    return db.query(Employee).filter(Employee.user_id == user.id).first()