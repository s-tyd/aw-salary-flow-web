# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## 言語とコミュニケーション

**重要**: このプロジェクトでは日本語でコミュニケーションを行ってください。ユーザーとは日本語でやり取りし、コメントや説明も日本語で記述してください。

## プロジェクト概要

これは従業員の給与と勤務データを管理するモダンなフルスタックWebアプリケーションです。プロジェクトはフロントエンドとバックエンドサービス間の明確な分離に従い、PostgreSQLをプライマリデータベースとしています。

**重要な背景**: このWebアプリケーションは、`/old/salary_flow_aw/` ディレクトリにある既存のFlutter/DartアプリケーションをモダンなWeb技術スタックに移行したものです。元のアプリケーションはFirebaseを使用したmacOSアプリでしたが、この新しいバージョンではNext.js + FastAPI + PostgreSQLの構成に変更されています。

**技術スタック:**
- フロントエンド: Next.js 15 with React 19, TypeScript, Tailwind CSS
- バックエンド: FastAPI with Python 3.11+, SQLAlchemy, Alembic
- データベース: PostgreSQL (開発・本番環境統一)
- 認証: JWT tokens with OAuth2
- 開発: Docker Compose for local environment
- アーキテクチャ: クリーンアーキテクチャ（API層、Service層、Core層の分離）

## アーキテクチャ

### バックエンド構造 (`/backend/`)
- **main.py**: FastAPIアプリケーションのエントリーポイント（ルーター登録のみ）
- **api/**: APIエンドポイント（認証、ユーザー、Excelテンプレート別に分離）
- **core/**: 設定とセキュリティ機能（config.py, security.py）
- **services/**: ビジネスロジック（employee_service.py等）
- **models.py**: SQLAlchemy ORMモデル（User, Employee, WorkData, Expense, ExcelTemplate）
- **schemas.py**: リクエスト/レスポンス検証用のPydanticスキーマ
- **database.py**: データベース設定とセッション管理
- **alembic/**: データベースマイグレーション管理

### フロントエンド構造 (`/frontend/src/`)
- **app/**: Next.js App Routerページ（dashboard, login等）
- **components/**: Reactコンポーネント（LoginForm等）
- **contexts/**: Reactコンテキスト（AuthContext, ThemeContext, DateContext）
- **lib/**: ユーティリティライブラリ
  - **api/**: APIクライアント（auth.ts, users.ts, excel-templates.ts）
  - **types/**: TypeScript型定義（統一された型管理）
- **hooks/**: カスタムフック（useExcelTemplates等）
- 型安全なAPIクライアント層によるバックエンドとの通信
- エラーハンドリングとローディング状態の統一管理

### データベースモデル
- **User**: 認証とユーザー管理
- **Employee**: ユーザーにリンクされた従業員情報
- **WorkData**: 時間追跡と残業を含む日次勤務記録
- **Expense**: カテゴリと承認状況を含む経費申請
- **ExcelTemplate**: Excelテンプレートファイルの管理（バイナリデータ、メタデータ）

## 開発コマンド

**重要**: このプロジェクトではDocker Composeの新しいバージョンを使用しています。`docker-compose`コマンドは廃止されており、代わりに`docker compose`（ハイフンなし）を使用してください。

### フルスタック開発（推奨）
```bash
# Docker Composeで全スタックを開始
docker compose up --build

# pgAdmin（データベース管理画面）も含めて起動
docker compose up --build

# 個別サービスの起動
docker compose up -d postgres    # PostgreSQLのみ
docker compose up -d pgadmin     # pgAdminのみ
docker compose up -d backend     # バックエンドのみ
docker compose up -d frontend    # フロントエンドのみ

# アクセスポイント:
# - フロントエンド: http://localhost:3000
# - バックエンドAPI: http://localhost:8000
# - PostgreSQL: localhost:5432
# - pgAdmin（DB管理画面）: http://localhost:8080
#   - Email: admin@example.com
#   - Password: admin
```

### フロントエンド開発
```bash
cd frontend
npm install
npm run dev          # Turbopackで開発サーバーを開始
npm run build        # プロダクション用ビルド
npm run start        # プロダクションサーバーを開始
npm run lint         # ESLintを実行
```

**注意**: フロントエンドのみでの開発時は、バックエンドAPIへの接続エラーが発生しますが、各機能でモックデータが表示されるため、UI/UXの確認と開発が可能です。

### バックエンド開発
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload  # 自動リロードで開始
```

## 環境設定

### バックエンド環境変数
`/backend/.env`で必要:
```
DATABASE_URL=postgresql://user:password@localhost:5432/salary_flow_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### フロントエンド環境変数
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 主要APIエンドポイント

- `POST /register` - ユーザー登録
- `POST /token` - ログイン（OAuth2フォームデータ、JWTを返す）
- `GET /users/me` - 現在のユーザーを取得（Bearerトークンが必要）

## 重要な実装ノート

### 認証フロー
1. ログインは`/token`エンドポイントにOAuth2フォームデータを送信
2. バックエンドがJWTアクセストークンを返す
3. フロントエンドがAuthServiceを通じてトークンをlocalStorageに保存
4. その後のすべてのリクエストに`Authorization: Bearer <token>`ヘッダーを含める
5. AuthContextがグローバル認証状態管理を提供

### データベースリレーション
- ユーザーは複数の従業員を持つことができる
- 従業員は多くのWorkDataレコードとExpenseを持つ
- すべてのモデルにcreated_atタイムスタンプが含まれる

### CORS設定
バックエンドはローカル開発用に`http://localhost:3000`からの認証情報付きリクエストを許可。

## コード規約

- バックエンド: FastAPIとSQLAlchemyパターンに従い、検証にPydanticを使用
- フロントエンド: Next.js 15 App Router、TypeScript strict mode、スタイリングにTailwindを使用
- 認証: 適切なエラーハンドリングとトークンリフレッシュパターンを持つJWTトークン
- データベース: 適切な外部キーリレーションシップを持つSQLAlchemy ORMを使用