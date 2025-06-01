#!/bin/bash

# 開発環境の高速起動スクリプト

echo "🚀 Agileware給与計算システムを起動中..."

# 既存のコンテナを停止（エラーを無視）
echo "📦 既存のコンテナを停止中..."
docker compose down --remove-orphans 2>/dev/null || true

# ボリュームをクリーンアップ（必要に応じて）
echo "🧹 不要なDockerリソースをクリーンアップ中..."
docker system prune -f --volumes 2>/dev/null || true

# 並列でビルドして起動
echo "🔨 サービスをビルド・起動中..."
docker compose up --build --parallel

echo "✨ 起動完了！"
echo "📱 フロントエンド: http://localhost:3000"
echo "🔧 バックエンドAPI: http://localhost:8000"
echo "💾 PostgreSQL: localhost:5432"
echo ""
echo "ファイルを編集すると自動的にリロードされます 🔄"