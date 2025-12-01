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
# 修正: 正確なパッケージ名を使用
RUN turbo prune --scope=@app/auto-clipper-web --docker

# 3. Installer Stage
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile
COPY --from=builder /app/out/full/ .

# 4. Runner Stage
FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
WORKDIR /app/apps/auto-clipper-web

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED 1
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["pnpm", "dev"]