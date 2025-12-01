# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Base Stage: 共通設定
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat openssl

# -----------------------------------------------------------------------------
# Builder Stage: Turbo Prune によるスコープ分離 (最重要)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
# money-master とその依存パッケージだけを抽出
# これにより、無関係なアプリの変更によるキャッシュ無効化を防ぐ
RUN turbo prune --scope=money-master --docker

# -----------------------------------------------------------------------------
# Installer Stage: 依存関係のインストール
# -----------------------------------------------------------------------------
FROM base AS installer
WORKDIR /app

# 1. 依存関係定義(json)とロックファイルのみをコピー
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./

# 2. 依存関係インストール (ここが最も時間がかかるためキャッシュを効かせる)
RUN pnpm install --no-frozen-lockfile

# 3. ソースコードをコピー (ここが変わってもインストールはスキップされる)
COPY --from=builder /app/out/full/ .

# 4. Prisma Client 生成
WORKDIR /app/apps/money-master
RUN pnpm exec prisma generate

# -----------------------------------------------------------------------------
# Runner Stage: 実行用軽量イメージ
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

# インストーラーから必要なファイルだけをコピー
COPY --from=installer /app .

WORKDIR /app/apps/money-master

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED 1

# HMRポーリング制御用 (デフォルトはOFFにして負荷を下げる)
ENV WATCHPACK_POLLING=false

EXPOSE 3000

CMD ["pnpm", "dev"]