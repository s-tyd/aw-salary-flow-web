# Agileware給与計算システム - Makefile
.PHONY: help dev up down clean rebuild logs shell-frontend shell-backend shell-db test lint format install status migrate migration migrate-history migrate-downgrade

# デフォルトターゲット
.DEFAULT_GOAL := help

# ヘルプメッセージ
help: ## 🔹 利用可能なコマンドを表示
	@echo "🚀 Agileware給与計算システム - 開発コマンド"
	@echo ""
	@echo "📦 基本操作:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "💡 使用例:"
	@echo "  make dev     # 開発環境を起動"
	@echo "  make logs    # ログを確認"
	@echo "  make clean   # 環境をクリーンアップ"

# 開発環境操作
dev: ## 🚀 開発環境を起動（ホットリロード有効）
	@echo "🚀 開発環境を起動中..."
	@docker compose down --remove-orphans 2>/dev/null || true
	@docker compose up --build

up: ## ▶️ サービスを起動
	@echo "▶️ サービスを起動中..."
	@docker compose up -d

down: ## ⏹️ サービスを停止
	@echo "⏹️ サービスを停止中..."
	@docker compose down

restart: ## 🔄 サービスを再起動
	@echo "🔄 サービスを再起動中..."
	@docker compose restart

# ビルドとクリーンアップ
rebuild: ## 🔨 完全リビルド
	@echo "🔨 完全リビルドを実行中..."
	@docker compose down --volumes --remove-orphans
	@docker compose build --no-cache
	@docker compose up -d

clean: ## 🧹 Dockerリソースをクリーンアップ
	@echo "🧹 Dockerリソースをクリーンアップ中..."
	@docker compose down --volumes --remove-orphans
	@docker system prune -af --volumes
	@echo "✨ クリーンアップ完了"

# ログとモニタリング
logs: ## 📝 全サービスのログを表示
	@docker compose logs -f

logs-frontend: ## 📱 フロントエンドのログを表示
	@docker compose logs -f frontend

logs-backend: ## 🔧 バックエンドのログを表示
	@docker compose logs -f backend

logs-db: ## 💾 データベースのログを表示
	@docker compose logs -f postgres

status: ## 📊 サービスの状態を確認
	@echo "📊 サービス状態:"
	@docker compose ps
	@echo ""
	@echo "🔗 アクセスURL:"
	@echo "  フロントエンド: http://localhost:3000"
	@echo "  バックエンドAPI: http://localhost:8000"
	@echo "  データベース:   localhost:5432"

# シェルアクセス
shell-frontend: ## 🐚 フロントエンドコンテナにシェルアクセス
	@docker compose exec frontend sh

shell-backend: ## 🐚 バックエンドコンテナにシェルアクセス
	@docker compose exec backend bash

shell-db: ## 🐚 データベースにアクセス
	@docker compose exec postgres psql -U user -d salary_flow_db

# 開発ツール
install-frontend: ## 📦 フロントエンドの依存関係をインストール
	@echo "📦 フロントエンドの依存関係をインストール中..."
	@docker compose exec frontend npm install

install-backend: ## 📦 バックエンドの依存関係をインストール
	@echo "📦 バックエンドの依存関係をインストール中..."
	@docker compose exec backend pip install -r requirements.txt

# テストとリント
test: ## 🧪 テストを実行
	@echo "🧪 テストを実行中..."
	@echo "フロントエンドテスト:"
	@docker compose exec frontend npm test 2>/dev/null || echo "テストスクリプトが設定されていません"
	@echo "バックエンドテスト:"
	@docker compose exec backend python -m pytest 2>/dev/null || echo "テストスクリプトが設定されていません"

lint: ## 🔍 コードリントを実行
	@echo "🔍 コードリントを実行中..."
	@echo "フロントエンドリント:"
	@docker compose exec frontend npm run lint 2>/dev/null || echo "リントスクリプトが設定されていません"
	@echo "バックエンドリント:"
	@docker compose exec backend black . --check 2>/dev/null || echo "Black（Python formatter）がインストールされていません"

format: ## ✨ コードフォーマットを実行
	@echo "✨ コードフォーマットを実行中..."
	@echo "フロントエンドフォーマット:"
	@docker compose exec frontend npm run format 2>/dev/null || echo "フォーマットスクリプトが設定されていません"
	@echo "バックエンドフォーマット:"
	@docker compose exec backend black . 2>/dev/null || echo "Black（Python formatter）がインストールされていません"

# データベース操作
migrate: ## 📊 データベースマイグレーションを実行
	@echo "📊 データベースマイグレーションを実行中..."
	@docker compose exec backend alembic upgrade head

migration: ## 🆕 新しいマイグレーションファイルを作成
	@echo "🆕 新しいマイグレーションファイルを作成中..."
	@read -p "マイグレーション名を入力してください: " name; \
	docker compose exec backend alembic revision --autogenerate -m "$$name"

migrate-history: ## 📜 マイグレーション履歴を表示
	@echo "📜 マイグレーション履歴:"
	@docker compose exec backend alembic history --verbose

migrate-current: ## 📍 現在のマイグレーション状態を表示
	@echo "📍 現在のマイグレーション状態:"
	@docker compose exec backend alembic current

migrate-downgrade: ## ⬇️ マイグレーションをダウングレード
	@echo "⬇️ マイグレーションをダウングレード中..."
	@echo "⚠️  警告: この操作はデータを失う可能性があります！"
	@read -p "ダウングレード先のリビジョンを入力してください (例: head-1, -1): " revision; \
	docker compose exec backend alembic downgrade "$$revision"

# 旧コマンドの互換性維持
db-migrate: migrate ## 📊 [非推奨] データベースマイグレーションを実行（migrateを使用してください）

db-reset: ## 🔄 データベースをリセット
	@echo "🔄 データベースをリセット中..."
	@docker compose down postgres
	@docker volume rm aw-salary-flow-web_postgres_data 2>/dev/null || true
	@docker compose up -d postgres
	@echo "⏳ PostgreSQLの起動を待機中..."
	@sleep 10
	@echo "✅ データベースリセット完了"

# バックアップと復元
backup: ## 💾 データベースをバックアップ
	@echo "💾 データベースをバックアップ中..."
	@mkdir -p ./backups
	@docker compose exec postgres pg_dump -U user salary_flow_db > ./backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ バックアップ完了: ./backups/"

# 開発支援
watch: ## 👀 ファイル変更を監視（サービス状況を表示）
	@echo "👀 サービス状況を監視中... (Ctrl+Cで停止)"
	@while true; do \
		clear; \
		echo "🚀 Agileware給与計算システム - 監視モード"; \
		echo "⏰ $$(date)"; \
		echo ""; \
		docker compose ps; \
		echo ""; \
		echo "📊 CPU/メモリ使用量:"; \
		docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $$(docker compose ps -q) 2>/dev/null || echo "統計情報を取得できません"; \
		sleep 5; \
	done

# プロダクション準備
prod-build: ## 🏗️ プロダクション用ビルド
	@echo "🏗️ プロダクション用ビルドを実行中..."
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml build 2>/dev/null || echo "docker-compose.prod.ymlが見つかりません"

# セットアップ
setup: ## 🛠️ 初回セットアップ
	@echo "🛠️ 初回セットアップを実行中..."
	@echo "1️⃣ Dockerコンテナをビルド..."
	@docker compose build
	@echo "2️⃣ サービスを起動..."
	@docker compose up -d
	@echo "3️⃣ データベースの準備を待機..."
	@sleep 10
	@echo "4️⃣ 依存関係をインストール..."
	@make install-frontend
	@make install-backend
	@echo "✅ セットアップ完了！"
	@echo ""
	@echo "🎉 以下のURLでアクセスできます:"
	@echo "   フロントエンド: http://localhost:3000"
	@echo "   バックエンドAPI: http://localhost:8000"

# ドキュメント
docs: ## 📚 ドキュメントを表示
	@echo "📚 Agileware給与計算システム - ドキュメント"
	@echo ""
	@echo "🏗️ アーキテクチャ:"
	@echo "  - フロントエンド: Next.js 15 + React 19 + TypeScript"
	@echo "  - バックエンド:   FastAPI + Python 3.11"
	@echo "  - データベース:   PostgreSQL 15"
	@echo "  - 開発環境:       Docker Compose"
	@echo ""
	@echo "📁 ディレクトリ構成:"
	@echo "  frontend/        Next.jsアプリケーション"
	@echo "  backend/         FastAPIアプリケーション"
	@echo "  old/             旧Flutter/Dartアプリケーション"
	@echo ""
	@echo "🔧 よく使うコマンド:"
	@echo "  make dev        開発環境起動"
	@echo "  make logs       ログ確認"
	@echo "  make clean      環境クリーンアップ"
	@echo "  make status     サービス状態確認"