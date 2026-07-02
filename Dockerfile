# syntax=docker/dockerfile:1

# Next.js (App Router) использует SSR + rewrites на BACKEND_URL (резолвится
# на этапе `next build`, см. ARG BACKEND_URL ниже — это не рантайм-параметр),
# поэтому раздать его как чисто статический SPA через nginx нельзя —
# нужен Node-процесс. Используем `output: "standalone"` (next.config.mjs),
# что даёт минимальный self-contained рантайм без node_modules целиком.

# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# rewrites() в next.config.mjs резолвится во время `next build`, а не в рантайме —
# поэтому BACKEND_URL должен быть известен уже на этапе сборки образа.
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Standalone-сборка Next.js уже содержит только нужные для рантайма
# node_modules и минимальный server.js — не копируем dev-зависимости.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
