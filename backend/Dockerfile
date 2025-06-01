# マルチステージビルドで最適化
FROM python:3.11-slim as builder

# 依存関係のみをインストール
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 本番用ステージ
FROM python:3.11-slim

# セキュリティ向上のため非rootユーザーを作成
RUN useradd --create-home --shell /bin/bash app

# 本番環境向けの最適化
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH=/home/app/.local/bin:$PATH

WORKDIR /app

# ビルドステージから依存関係をコピー
COPY --from=builder /root/.local /home/app/.local

# ソースコードをコピー
COPY . .

# 所有者を変更
RUN chown -R app:app /app

# 非rootユーザーに切り替え
USER app

EXPOSE 8000

# 本番サーバーを起動（リロードなし）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]