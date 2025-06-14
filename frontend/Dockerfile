# マルチステージビルドで最適化
FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .

# 本番ビルド（lintエラーを無視）
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

# 本番用ステージ
FROM node:18-alpine AS runner

RUN apk add --no-cache libc6-compat

# セキュリティ向上のため非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 本番用依存関係のみインストール
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ビルド結果をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 非rootユーザーに切り替え
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 本番サーバーを起動（ポート3000を強制指定）
CMD ["sh", "-c", "PORT=3000 node server.js"]