# Talkto Deployment Guide

Talkto uses a **custom Node.js server** with Socket.io. Serverless platforms like Vercel (without a separate WebSocket service) are **not supported**.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Environment variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (public URL of your app)

## Local Development

```bash
# Start PostgreSQL only
docker compose up db -d

cp .env.example .env
# Edit .env with your secrets

npx prisma migrate dev
npm run dev
```

Open:
- App: http://localhost:3010
- API docs: http://localhost:3010/docs
- Health: http://localhost:3010/api/health

## Docker (app + database)

```bash
export NEXTAUTH_SECRET=your-secret
export NEXTAUTH_URL=http://localhost:3010
docker compose up --build
```

## Railway

1. Create a new project on [Railway](https://railway.app)
2. Add **PostgreSQL** plugin
3. Deploy from GitHub using the included `Dockerfile`
4. Set environment variables:
   - `DATABASE_URL` (from Railway Postgres)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Railway app URL)
5. Run migrations: `npx prisma migrate deploy` (one-off command or release phase)

## Render (ฟรี — แนะนำสำหรับทดสอบ)

ดูขั้นตอนละเอียด (Neon PostgreSQL ฟรี + Render Blueprint): **[deploy-free.md](./deploy-free.md)**

1. สร้าง DB ฟรีที่ [Neon](https://neon.tech)
2. Push repo ขึ้น GitHub
3. สร้าง **Blueprint** บน [Render](https://render.com) — ใช้ `render.yaml` ใน repo
4. ตั้ง env: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_*`
5. Health check path: `/api/health`

## Hostinger

ดูขั้นตอนละเอียด (VPS + PM2 + Nginx หรือ Node.js Web App): **[deploy-hostinger.md](./deploy-hostinger.md)**

## Notes

- Socket.io requires a persistent process — use Web Service, not static hosting
- Set `NEXTAUTH_URL` to your production URL before going live
- Monitor `/api/health` for database connectivity
