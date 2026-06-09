FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma
RUN npx prisma generate
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/src ./src
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh
EXPOSE 10000
CMD ["./scripts/docker-entrypoint.sh"]
