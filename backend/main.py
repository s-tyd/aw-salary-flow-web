from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api import auth, users, employees, excel_templates, calculation_periods, freee_expenses, kincone_transportation, attendance_records, payroll

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターを登録
app.include_router(auth.router, tags=["認証"])
app.include_router(users.router, tags=["ユーザー"])
app.include_router(employees.router, tags=["社員管理"])
app.include_router(excel_templates.router, tags=["Excelテンプレート"])
app.include_router(calculation_periods.router, tags=["計算期間管理"])
app.include_router(freee_expenses.router, prefix="/freee-expenses", tags=["Freee経費"])
app.include_router(kincone_transportation.router, prefix="/kincone-transportation", tags=["Kincone交通費"])
app.include_router(attendance_records.router, prefix="/attendance-records", tags=["勤務データ"])
app.include_router(payroll.router, prefix="/payroll", tags=["給与計算"])

@app.get("/")
def read_root():
    return {"message": f"{settings.PROJECT_NAME} is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}