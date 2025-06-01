FROM node:18-alpine

# 開発環境向けの最適化
RUN apk add --no-cache libc6-compat

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール（開発依存関係も含む）
RUN npm ci

# ソースコードをコピー
COPY . .

# Next.jsの設定でファイル監視を有効化
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

# 開発サーバーを起動（Turbopack使用）
CMD ["npm", "run", "dev"]