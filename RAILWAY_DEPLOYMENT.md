# Railway デプロイメント手順

## 前提条件

- GitHubアカウント
- Railwayアカウント（https://railway.app）
- このリポジトリがGitHubにプッシュされていること

## 1. Railwayでのプロジェクト作成

### Railwayアカウント作成
1. https://railway.app にアクセス
2. "Start a New Project" をクリック
3. GitHubアカウントで認証

### プロジェクトセットアップ
1. "Deploy from GitHub repo" を選択
2. このリポジトリ（aw-salary-flow-web）を選択
3. "Deploy Now" をクリック

## 2. サービスの設定

Railwayは自動的に以下のサービスを検出します：

### PostgreSQLデータベース
1. "Add a Service" → "Database" → "PostgreSQL"
2. 自動的にデータベースが作成される
3. 環境変数が自動設定される

### バックエンドサービス
1. "Add a Service" → "GitHub Repo"
2. Root directory: `backend`
3. Dockerfile: `Dockerfile.prod`

### フロントエンドサービス  
1. "Add a Service" → "GitHub Repo"
2. Root directory: `frontend`
3. Dockerfile: `Dockerfile.prod`

## 3. 環境変数の設定

### バックエンドサービス
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-very-secure-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### フロントエンドサービス
```
NEXT_PUBLIC_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

## 4. ネットワーキング設定

### Public Networking
1. 各サービスで "Settings" → "Networking"
2. "Generate Domain" をクリック
3. カスタムドメインを設定（オプション）

### サービス間通信
- バックエンド ← PostgreSQL: 自動設定
- フロントエンド ← バックエンド: 環境変数で設定

## 5. デプロイメント

### 自動デプロイ
- GitHubへのプッシュで自動デプロイ
- `main`ブランチのみ監視

### 手動デプロイ
1. Railwayダッシュボードで該当サービスを選択
2. "Deploy" ボタンをクリック

## 6. ヘルスチェック

### バックエンド確認
```bash
curl https://your-backend-domain.railway.app/docs
```

### フロントエンド確認
```bash
curl https://your-frontend-domain.railway.app
```

## 7. ログ確認

1. Railwayダッシュボードで該当サービスを選択
2. "Logs" タブでリアルタイムログを確認

## 8. スケーリング設定

### リソース制限
- CPU: 1 vCPU
- Memory: 1GB
- 複数インスタンス: 利用可能

### 設定方法
1. サービス選択 → "Settings" → "Resources"
2. CPU/Memoryの制限を設定

## 9. データベースマイグレーション

### 初回セットアップ
```bash
# Railway CLIでバックエンドサービスに接続
railway run python -m alembic upgrade head
```

### 本番環境での実行
1. Railwayダッシュボードで "One-off Command" を実行
2. `python -m alembic upgrade head`

## 10. 監視とアラート

### ビルドイン監視
- CPU/Memory使用率
- リクエスト数
- エラー率

### 外部監視（推奨）
- Uptime Robot
- New Relic
- Datadog

## トラブルシューティング

### よくある問題

#### ビルドエラー
- `Dockerfile.prod`が正しいディレクトリにあるか確認
- 依存関係ファイル（requirements.txt, package.json）の確認

#### 環境変数エラー
- 全ての必要な環境変数が設定されているか確認
- データベースURL接続の確認

#### ネットワークエラー
- サービス間の環境変数が正しく設定されているか確認
- Public Domainが生成されているか確認

### デバッグコマンド
```bash
# Railway CLIインストール
npm install -g @railway/cli

# プロジェクトにログイン
railway login

# ログ確認
railway logs

# 環境変数確認
railway variables
```

## 料金について

### 無料枠
- 月間500時間まで無料
- 複数サービス利用可能

### 有料プラン
- $5/月から
- より多いリソースとサポート

## セキュリティ考慮事項

1. **SECRET_KEY**: 必ず変更
2. **データベース**: SSL接続を有効化
3. **ドメイン**: HTTPSを強制
4. **環境変数**: 機密情報はRailway側で管理

## 更新とメンテナンス

### 定期的な作業
- セキュリティアップデート
- 依存関係の更新
- ログ監視
- バックアップ確認（Railwayが自動実行）

---

## 参考リンク

- [Railway公式ドキュメント](https://docs.railway.app/)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)