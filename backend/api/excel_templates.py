from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io
import re
from sqlalchemy import func

from database import get_db
from models import User, ExcelTemplate
from schemas import ExcelTemplateResponse, ExcelTemplateListResponse
from core.security import get_current_user

router = APIRouter()

def get_next_version(user_id: int, db: Session) -> str:
    """ユーザーのテンプレートの次のバージョンを計算（アップロード順）"""
    try:
        # ユーザーのすべてのテンプレートを取得し、バージョン数をカウント
        template_count = db.query(ExcelTemplate).filter(
            ExcelTemplate.created_by_user_id == user_id
        ).count()
        
        # 次のバージョン番号を計算（1.0, 2.0, 3.0, ...）
        next_version = template_count + 1
        return f"{next_version}.0"
        
    except Exception as e:
        # エラーが発生した場合は1.0を返す
        print(f"バージョン計算エラー: {e}")
        return "1.0"

@router.get("/excel-templates", response_model=List[ExcelTemplateListResponse])
async def get_excel_templates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """現在のユーザーのExcelテンプレート一覧を取得（アップロード順）"""
    templates = db.query(ExcelTemplate).filter(
        ExcelTemplate.created_by_user_id == current_user.id
    ).order_by(
        ExcelTemplate.created_at.desc()
    ).all()
    return templates

@router.post("/excel-templates", response_model=ExcelTemplateResponse)
async def create_excel_template(
    name: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """新しいExcelテンプレートをアップロード"""
    # ファイル形式チェック
    allowed_mime_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # .xlsx
        "application/vnd.ms-excel"  # .xls
    ]
    
    if file.content_type not in allowed_mime_types:
        raise HTTPException(
            status_code=400,
            detail="Excelファイル (.xlsx または .xls) のみアップロード可能です"
        )
    
    # ファイル内容を読み込み
    file_content = await file.read()
    
    # 自動バージョニング（アップロード順）
    next_version = get_next_version(current_user.id, db)
    
    # テンプレート作成
    db_template = ExcelTemplate(
        created_by_user_id=current_user.id,
        name=name,
        description=description if description else None,
        file_name=file.filename,
        file_data=file_content,
        file_size=len(file_content),
        mime_type=file.content_type,
        version=next_version
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template

@router.get("/excel-templates/{template_id}/download")
async def download_excel_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Excelテンプレートをダウンロード"""
    # テンプレート取得
    template = db.query(ExcelTemplate).filter(
        ExcelTemplate.id == template_id,
        ExcelTemplate.created_by_user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="テンプレートが見つかりません")
    
    # ファイルをストリームとして返す
    return StreamingResponse(
        io.BytesIO(template.file_data),
        media_type=template.mime_type,
        headers={"Content-Disposition": f"attachment; filename={template.file_name}"}
    )

@router.delete("/excel-templates/{template_id}")
async def delete_excel_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Excelテンプレートを削除"""
    # テンプレート取得
    template = db.query(ExcelTemplate).filter(
        ExcelTemplate.id == template_id,
        ExcelTemplate.created_by_user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="テンプレートが見つかりません")
    
    db.delete(template)
    db.commit()
    
    return {"message": "テンプレートが削除されました"}