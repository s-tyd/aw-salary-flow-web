# Salary Flow Web Application

従業員の給与と勤務データを管理するモダンなフルスタックWebアプリケーションです。Flutter/DartアプリケーションからNext.js + FastAPI + PostgreSQLスタックに移行したシステムです。

## 技術スタック

- **フロントエンド**: Next.js 15.3.3 + React 19 + TypeScript
- **バックエンド**: FastAPI + Python 3.11+ + SQLAlchemy + Alembic
- **データベース**: PostgreSQL 15
- **認証**: JWT tokens (OAuth2)
- **スタイリング**: Tailwind CSS 3.4.0
- **開発環境**: Docker Compose
- **デプロイ**: AWS App Runner + ECR / Railway
- **CI/CD**: GitHub Actions

## プロジェクト構成

```
aw-salary-flow-web/
├── frontend/                    # Next.js React アプリケーション
│   ├── src/
│   │   ├── app/                # App Router ページ
│   │   │   ├── dashboard/      # ダッシュボード
│   │   │   ├── employees/      # 社員管理
│   │   │   ├── attendance-records/ # 勤務記録
│   │   │   ├── freee-expenses/ # Freee経費管理
│   │   │   ├── kincone-transportation/ # Kincone交通費
│   │   │   └── excel-templates/ # Excelテンプレート
│   │   ├── components/         # Reactコンポーネント
│   │   ├── contexts/          # 状態管理 (Auth, Theme, Date)
│   │   ├── hooks/             # カスタムフック
│   │   ├── services/          # APIクライアント
│   │   └── utils/             # ユーティリティ
│   ├── Dockerfile
│   └── Dockerfile.prod
├── backend/                     # FastAPI アプリケーション
│   ├── api/                    # APIエンドポイント層
│   │   ├── auth.py            # 認証
│   │   ├── employees.py       # 社員管理
│   │   ├── attendance_records.py # 勤務記録
│   │   ├── freee_expenses.py  # Freee経費
│   │   ├── kincone_transportation.py # Kincone交通費
│   │   ├── payroll.py         # 給与計算
│   │   └── excel_templates.py # Excelテンプレート
│   ├── core/                  # 設定・セキュリティ
│   ├── services/              # ビジネスロジック
│   ├── alembic/               # DBマイグレーション
│   ├── models.py              # SQLAlchemy ORM
│   ├── schemas.py             # Pydantic スキーマ
│   ├── database.py            # DB設定
│   ├── Dockerfile
│   └── Dockerfile.prod
├── .github/workflows/          # CI/CD設定
├── railway.toml               # Railway設定
├── railway.json               # Railway デプロイ設定
├── .env.railway               # Railway環境変数テンプレート
├── RAILWAY_DEPLOYMENT.md      # Railway デプロイ手順
└── docker-compose.yml         # 開発環境
```

## 主要機能

### ✅ 実装済み機能
- **認証システム**: JWT認証（OAuth2フォーム）
- **CSVデータインポート**:
  - Freee経費データ管理
  - Kincone交通費データ管理
  - 勤務データ管理
- **給与計算**: Excel形式での給与計算書生成
- **計算期間管理**: 年月ベースの計算期間設定
- **Excelテンプレート管理**: カスタムテンプレート管理
- **レスポンシブUI**: ダークモード対応

### 🔄 部分実装機能
- **社員管理**: CRUD API実装済み（UI一部調整中）
- **ダッシュボード**: 統計表示（データ統合調整中）

### 📋 実装予定機能
- KiwiGoレポート機能
- 社員情報一括アップロード
- 詳細統計・レポート機能

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Docker を使用した開発（推奨）

1. リポジトリをクローン
2. 環境ファイルを作成:

```bash
# バックエンド環境設定
cp backend/.env.example backend/.env
```

3. 開発環境を起動:

```bash
# 注意: docker-compose ではなく docker compose を使用
docker compose up --build
```

以下のサービスが起動します:
- **PostgreSQL**: localhost:5432 (データベース)
- **FastAPI**: localhost:8000 (バックエンドAPI)
- **Next.js**: localhost:3000 (フロントエンド)
- **pgAdmin**: localhost:8080 (DB管理画面)
  - Email: admin@example.com
  - Password: admin

### 個別サービス起動

```bash
docker compose up -d postgres    # PostgreSQLのみ
docker compose up -d pgadmin     # pgAdminのみ
docker compose up -d backend     # バックエンドのみ
docker compose up -d frontend    # フロントエンドのみ
```

### Local Development

#### バックエンド個別セットアップ

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .env ファイルを編集してデータベース設定を行う

# 初期管理者ユーザー作成
python create_admin.py

# サーバー起動
uvicorn main:app --reload
```

#### フロントエンド個別セットアップ

```bash
cd frontend
npm install
npm run dev          # 開発サーバー（Turbopack）
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー
npm run lint         # ESLint実行
```

**注意**: フロントエンドのみでの開発時は、バックエンドAPIへの接続エラーが発生しますが、各機能でモックデータが表示されるため、UI/UXの確認と開発が可能です。

## API エンドポイント

### 認証
- `POST /register` - ユーザー登録
- `POST /token` - ログイン（OAuth2フォーム、JWTを返す）
- `GET /users/me` - 現在のユーザー情報取得（Bearerトークン必要）

### 社員管理
- `GET /employees` - 社員一覧取得
- `POST /employees` - 社員作成
- `PUT /employees/{id}` - 社員更新
- `DELETE /employees/{id}` - 社員削除

### データインポート
- `POST /freee-expenses/upload` - Freee経費CSVアップロード
- `GET /freee-expenses` - Freee経費データ一覧
- `POST /kincone-transportation/upload` - Kincone交通費CSVアップロード
- `GET /kincone-transportation` - Kincone交通費データ一覧
- `POST /attendance-records/upload` - 勤務記録CSVアップロード
- `GET /attendance-records` - 勤務記録一覧

### 給与計算
- `POST /payroll/calculate` - 給与計算実行
- `GET /payroll/download/{calculation_id}` - 給与計算書ダウンロード

### 計算期間・テンプレート管理
- `GET /calculation-periods` - 計算期間一覧
- `POST /calculation-periods` - 計算期間作成
- `GET /excel-templates` - Excelテンプレート一覧
- `POST /excel-templates/upload` - テンプレートアップロード

## データベースモデル

### 主要モデル
- **User**: 認証とユーザー管理
- **Employee**: 従業員情報（従業員番号、氏名、入社日、Kiwi名等）
- **CalculationPeriod**: 計算期間（年月管理、ステータス管理）
- **AttendanceRecord**: 勤務記録（総労働時間、残業時間等）
- **FreeeExpense**: Freee経費データ
- **KinconeTransportation**: Kincone交通費データ
- **ExcelTemplate**: Excelテンプレート管理（バイナリデータ、メタデータ）
- **SalaryCalculation**: 給与計算結果

### リレーション
- ユーザーは複数の従業員を持つことができる
- 従業員は多くのAttendanceRecordとExpenseを持つ
- すべてのモデルにcreated_atタイムスタンプが含まれる

## 環境変数

### バックエンド (.env)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/salary_flow_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### フロントエンド

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## デプロイメント

### オプション1: Railway（推奨・簡単）

Railwayを使用したDocker Composeベースのデプロイ。詳細は[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)を参照。

**簡単デプロイ手順:**
1. [Railway.app](https://railway.app)にアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定（`.env.railway`を参照）
4. 自動デプロイ開始

**メリット:**
- Docker Composeをそのまま使用可能
- 複数サービスを簡単管理
- PostgreSQLデータベース自動セットアップ
- 無料枠あり（月間500時間）

### オプション2: AWS App Runner

GitHub ActionsによるCI/CDを使用したAWS App Runnerへのデプロイ。

**必要なGitHub Secrets:**
- `ECR_REGISTRY`: ECRレジストリURL
- `AWS_ACCOUNT_ID`: AWSアカウントID
- その他AWS認証情報

**特徴:**
- 本格的なAWSインフラ
- ECR + App Runnerの組み合わせ
- マルチステージビルド最適化

### ローカル本番ビルド

```bash
# バックエンド本番ビルド
cd backend
docker build -f Dockerfile.prod -t salary-flow-backend .

# フロントエンド本番ビルド
cd frontend
docker build -f Dockerfile.prod -t salary-flow-frontend .
```

## 初期ユーザー

開発環境での初期管理者ユーザー:
- **Email**: `admin@agileware.com`
- **Password**: `admin123`

```bash
# 初期管理者ユーザーを作成
cd backend
python create_admin.py
```

**注意**: 本番環境では必ずパスワードを変更してください。

## 重要な実装ノート

### 認証フロー
1. ログインは`/token`エンドポイントにOAuth2フォームデータを送信
2. バックエンドがJWTアクセストークンを返す
3. フロントエンドがAuthServiceを通じてトークンをlocalStorageに保存
4. その後のすべてのリクエストに`Authorization: Bearer <token>`ヘッダーを含める
5. AuthContextがグローバル認証状態管理を提供

### CORS設定
バックエンドはローカル開発用に`http://localhost:3000`からの認証情報付きリクエストを許可。

## コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更を行う
4. 変更をテスト
5. プルリクエストを作成

## トラブルシューティング

### Docker Composeの注意点
- **重要**: `docker-compose`コマンドは廃止されており、代わりに`docker compose`（ハイフンなし）を使用してください。

### よくある問題
- **バックエンドAPI接続エラー**: フロントエンドのみでの開発時は正常です。モックデータが表示されます。
- **データベース接続エラー**: PostgreSQLコンテナが起動していることを確認してください。
- **認証エラー**: ブラウザのlocalStorageをクリアして再ログインしてください。
- **Railway デプロイエラー**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)のトラブルシューティングセクションを参照してください。

## 参考リンク

- **Railway公式**: https://railway.app
- **AWS App Runner**: https://aws.amazon.com/apprunner/
- **Next.js**: https://nextjs.org/
- **FastAPI**: https://fastapi.tiangolo.com/
- **PostgreSQL**: https://www.postgresql.org/
