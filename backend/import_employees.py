#!/usr/bin/env python3
"""
社員情報CSVファイルをデータベースにインポートするスクリプト
"""
import csv
import os
import sys
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import User, Employee
from core.config import settings

def read_csv_file(csv_path):
    """CSVファイルを読み込む"""
    employees_data = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            # リモート手当の判定（'x'がある場合はTrue）
            remote_allowance = bool(row.get('リモート手当上限なし', '').strip() == 'x')
            
            employee_data = {
                'employee_number': str(row['社員番号']).strip(),
                'name': row['給与計算氏名'].strip(),
                'resignation_date': None, # CSVにないため None
                
                'hire_date': None, # CSVにないため None
                'kincone_name': row['Kincone氏名'].strip() if row['Kincone氏名'].strip() else None,
                'freee_name': row['給与計算氏名'].strip(),  # 給与計算氏名をFreee氏名として使用
                'kiwi_name': row['Kiwi氏名'].strip() if row['Kiwi氏名'].strip() else None,
                'remote_allowance': remote_allowance
            }
            employees_data.append(employee_data)
    
    return employees_data

def get_or_create_default_user(db_session):
    """デフォルトユーザーを取得または作成"""
    user = db_session.query(User).filter(User.email == 'admin@agileware.com').first()
    
    if not user:
        from core.security import get_password_hash
        user = User(
            email='admin@agileware.com',
            name='管理者',
            hashed_password=get_password_hash('admin123')
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        print(f"デフォルトユーザーを作成しました: {user.email}")
    
    return user

def import_employees(csv_path, user_id):
    """社員データをデータベースにインポート"""
    # データベース接続
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db_session = Session()
    
    try:
        # CSVデータを読み込み
        employees_data = read_csv_file(csv_path)
        print(f"CSVファイルから {len(employees_data)} 件の社員データを読み込みました")
        
        # 既存の社員データを削除（user_idが一致するもの）
        existing_count = db_session.query(Employee).filter(Employee.user_id == user_id).count()
        if existing_count > 0:
            db_session.query(Employee).filter(Employee.user_id == user_id).delete()
            print(f"既存の {existing_count} 件の社員データを削除しました")
        
        # 新しい社員データを追加
        imported_count = 0
        for emp_data in employees_data:
            employee = Employee(
                user_id=user_id,
                employee_number=emp_data['employee_number'],
                name=emp_data['name'],
                
                
                hire_date=emp_data['hire_date'],
                resignation_date=emp_data['resignation_date'],
                kincone_name=emp_data['kincone_name'],
                freee_name=emp_data['freee_name'],
                kiwi_name=emp_data['kiwi_name'],
                remote_allowance=emp_data['remote_allowance']
            )
            db_session.add(employee)
            imported_count += 1
        
        # データベースにコミット
        db_session.commit()
        print(f"✅ {imported_count} 件の社員データをインポートしました")
        
        # リモート手当対象者の統計
        remote_count = sum(1 for emp in employees_data if emp['remote_allowance'])
        print(f"📊 リモート手当対象者: {remote_count} 名")
        
    except Exception as e:
        db_session.rollback()
        print(f"❌ インポート中にエラーが発生しました: {e}")
        raise
    finally:
        db_session.close()

def main():
    """メイン関数"""
    csv_path = '/app/社員情報.csv'  # Dockerコンテナ内のパス
    
    # ファイルの存在確認
    if not os.path.exists(csv_path):
        print(f"❌ CSVファイルが見つかりません: {csv_path}")
        return
    
    # データベース接続
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db_session = Session()
    
    try:
        # デフォルトユーザーを取得または作成
        user = get_or_create_default_user(db_session)
        
        # 社員データをインポート
        import_employees(csv_path, user.id)
        
    finally:
        db_session.close()

if __name__ == '__main__':
    main()