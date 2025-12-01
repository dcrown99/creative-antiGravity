# syntax=docker/dockerfile:1

# 1. Base Stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat openssl

# 2. Builder Stage
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
# 修正: Monorepoのルートから実行されるため、スコープ解決を確実に
# 注意: package.jsonのnameと一致させる必要があります。もしビルドが失敗する場合、ここを確認してください。
RUN turbo prune --scope=@app/my-kindle --docker

# 3. Installer Stage
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
# 修正: ルートのロックファイルを使って依存解決
RUN pnpm install --no-frozen-lockfile

COPY --from=builder /app/out/full/ .

# 4. Runner Stage
FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
WORKDIR /app/apps/my-kindle

# データディレクトリの権限設定
RUN mkdir -p data && chmod 777 data

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED 1
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["pnpm", "dev"]