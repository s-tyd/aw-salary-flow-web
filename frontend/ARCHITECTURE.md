# フロントエンドアーキテクチャ

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router ページ
├── components/             # 再利用可能なUIコンポーネント
├── contexts/              # React Context (認証、テーマ、日付)
├── hooks/                 # カスタムフック
├── lib/                   # レガシーAPIクライアント（段階的に削除予定）
├── services/              # ビジネスロジック層（新しいアーキテクチャ）
├── utils/                 # ユーティリティ関数
└── types/                 # TypeScript型定義
```

## 設計原則

### 1. 認証管理の一元化
- `AuthService`: トークン管理を一元化
- すべてのAPI呼び出しで統一された認証ヘッダーを使用

### 2. API通信の標準化
- `ApiService`: HTTP通信のラッパー
- エラーハンドリング、認証、レスポンス処理を統一

### 3. ドメイン駆動設計
- 各機能ごとにサービスクラスを作成（例：`FreeeExpenseService`）
- 関連するデータ型とビジネスロジックを同じファイルに配置

### 4. カスタムフックによる状態管理
- UIロジックとビジネスロジックを分離
- 再利用可能な状態管理（例：`useFreeeExpenses`）

## 使用例

### サービス層の使用
```typescript
import { FreeeExpenseService } from '@/services/FreeeExpenseService';

// 経費データ取得
const expenses = await FreeeExpenseService.getExpenses();

// CSVインポート
const result = await FreeeExpenseService.importCsv(file, periodId);
```

### カスタムフックの使用
```typescript
import { useFreeeExpenses } from '@/hooks/useFreeeExpenses';

function Component() {
  const { expenses, loading, error, importCsv } = useFreeeExpenses();
  // ...
}
```

### 認証の使用
```typescript
import { AuthService } from '@/services/AuthService';

// トークンチェック
if (AuthService.isAuthenticated()) {
  // 認証済み処理
}

// ログアウト
AuthService.logout();
```

## マイグレーション方針

1. **段階1**: 新しいサービス層を作成（完了）
2. **段階2**: 既存APIクライアントを新しいサービスに置き換え
3. **段階3**: レガシーコード（`lib/api/`）を削除
4. **段階4**: 型定義の整理と統合

## メンテナンス性の向上

- **単一責任原則**: 各サービスクラスは特定のドメインのみを担当
- **依存関係の明確化**: サービス → API → 認証の階層構造
- **型安全性**: TypeScriptによる静的型チェック
- **エラーハンドリング**: 統一されたエラー処理とログ出力
- **テスタビリティ**: モックしやすいサービス設計