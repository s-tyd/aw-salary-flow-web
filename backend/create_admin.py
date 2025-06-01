#!/usr/bin/env python3
"""
初期管理者ユーザーを作成するスクリプト
"""

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import get_db, engine
from models import Base, User

# パスワードハッシュ化の設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_user():
    # データベーステーブルを作成
    Base.metadata.create_all(bind=engine)
    
    # データベースセッションを取得
    db = next(get_db())
    
    try:
        # 既存のadminユーザーをチェック
        existing_user = db.query(User).filter(User.email == "admin@agileware.com").first()
        if existing_user:
            print("管理者ユーザーは既に存在します。")
            print(f"Email: admin@agileware.com")
            return
        
        # 管理者ユーザーを作成
        admin_user = User(
            email="admin@agileware.com",
            name="管理者",
            hashed_password=get_password_hash("admin123")
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("管理者ユーザーが作成されました！")
        print(f"Email: admin@agileware.com")
        print(f"Password: admin123")
        print("\n注意: 本番環境では必ずパスワードを変更してください。")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()