from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Employee
from schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from core.security import get_current_user

router = APIRouter()

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """現在のユーザーの社員一覧を取得"""
    employees = db.query(Employee).filter(Employee.user_id == current_user.id).all()
    return employees

@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """指定された社員の詳細を取得"""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.user_id == current_user.id
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="社員が見つかりません")
    
    return employee

@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(employee_data: EmployeeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """新しい社員を作成"""
    # 社員番号の重複チェック
    existing_employee = db.query(Employee).filter(
        Employee.employee_number == employee_data.employee_number,
        Employee.user_id == current_user.id
    ).first()
    
    if existing_employee:
        raise HTTPException(status_code=400, detail="この社員番号は既に使用されています")
    
    # 社員作成
    db_employee = Employee(
        user_id=current_user.id,
        employee_number=employee_data.employee_number,
        name=employee_data.name,
        hire_date=employee_data.hire_date,
        resignation_date=employee_data.resignation_date,
        kincone_name=employee_data.kincone_name,
        freee_name=employee_data.freee_name,
        kiwi_name=employee_data.kiwi_name,
        remote_allowance=employee_data.remote_allowance,
        is_active=employee_data.is_active
    )
    
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return db_employee

@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """社員情報を更新"""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.user_id == current_user.id
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="社員が見つかりません")
    
    # 社員番号の重複チェック（自分以外）
    if employee_data.employee_number and employee_data.employee_number != employee.employee_number:
        existing_employee = db.query(Employee).filter(
            Employee.employee_number == employee_data.employee_number,
            Employee.user_id == current_user.id,
            Employee.id != employee_id
        ).first()
        
        if existing_employee:
            raise HTTPException(status_code=400, detail="この社員番号は既に使用されています")
    
    # 社員情報更新（Noneでない場合のみ更新）
    if employee_data.employee_number is not None:
        employee.employee_number = employee_data.employee_number
    if employee_data.name is not None:
        employee.name = employee_data.name
    if employee_data.hire_date is not None:
        employee.hire_date = employee_data.hire_date
    if employee_data.resignation_date is not None:
        employee.resignation_date = employee_data.resignation_date
    if employee_data.kincone_name is not None:
        employee.kincone_name = employee_data.kincone_name
    if employee_data.freee_name is not None:
        employee.freee_name = employee_data.freee_name
    if employee_data.kiwi_name is not None:
        employee.kiwi_name = employee_data.kiwi_name
    if employee_data.remote_allowance is not None:
        employee.remote_allowance = employee_data.remote_allowance
    if employee_data.is_active is not None:
        employee.is_active = employee_data.is_active
    
    db.commit()
    db.refresh(employee)
    
    return employee

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """社員を削除"""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.user_id == current_user.id
    ).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="社員が見つかりません")
    
    db.delete(employee)
    db.commit()
    
    return {"message": "社員が削除されました"}