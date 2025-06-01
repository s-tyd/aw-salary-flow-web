"""
給与計算API
Firebase Cloud Functionsからの移行版
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from database import get_db
from core.security import get_current_user
from models import User
from schemas import (
    PayrollGenerationRequest, 
    PayrollGenerationResponse,
    WorkDataSummary
)
from services.payroll_service import PayrollService

router = APIRouter()

@router.post("/generate", response_model=PayrollGenerationResponse)
async def generate_payroll_excel(
    request: PayrollGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    給与計算Excelファイルを生成
    
    Firebase Cloud Functionsのgenerate_payroll関数を移行
    """
    try:
        payroll_service = PayrollService(db)
        result = payroll_service.generate_payroll_excel(
            calculation_period_id=request.calculation_period_id,
            template_id=request.template_id
        )
        
        if result.status == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"給与計算Excel生成に失敗しました: {', '.join(result.messages)}"
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"給与計算Excel生成中にエラーが発生しました: {str(e)}"
        )

@router.get("/work-data-summary/{calculation_period_id}", response_model=List[WorkDataSummary])
async def get_work_data_summary(
    calculation_period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    指定した計算期間の勤務データサマリを取得
    """
    try:
        payroll_service = PayrollService(db)
        summaries = payroll_service._get_work_data_summaries(calculation_period_id)
        
        return summaries
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"勤務データサマリ取得中にエラーが発生しました: {str(e)}"
        )

@router.get("/download/{file_name}")
async def download_payroll_file(
    file_name: str,
    current_user: User = Depends(get_current_user)
):
    """
    生成された給与計算Excelファイルをダウンロード
    """
    try:
        # ファイルパスの構築
        current_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
        project_root = os.path.dirname(current_dir)  # プロジェクトルート
        file_path = os.path.join(project_root, "output_files", file_name)
        
        # ファイル存在確認
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ファイルが見つかりません"
            )
        
        # セキュリティチェック: ファイル名の検証
        if not file_name.endswith('.xlsx') or '..' in file_name or '/' in file_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不正なファイル名です"
            )
        
        return FileResponse(
            path=file_path,
            filename=file_name,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ファイルダウンロード中にエラーが発生しました: {str(e)}"
        )