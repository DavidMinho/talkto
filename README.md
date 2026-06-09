# Talkto

เว็บแชทที่รองรับห้องกลุ่มและแชทส่วนตัว 1:1 สร้างด้วย Next.js, Material UI, PostgreSQL, Prisma และ Socket.io

## ฟีเจอร์

- สมัครสมาชิก / ล็อกอิน
- ห้องแชทกลุ่ม + แชท 1:1
- เชิญเข้าแชทผ่านลิงก์ (กลุ่ม + DM)
- Realtime messaging, typing indicator, online status
- Unread count, dark mode
- หน้า Admin จัดการสมาชิก + API Docs (เฉพาะ ADMIN)

## เริ่มต้นใช้งาน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า environment
cp .env.example .env

# 3. สร้าง database (SQLite — ใช้ได้ทันทีไม่ต้องติดตั้ง PostgreSQL)
npx prisma db push

# 4. ตั้งผู้ดูแลระบบ (เลือกวิธีใดวิธีหนึ่ง)
# วิธี A: ใส่อีเมลใน .env แล้วล็อกอินใหม่
# ADMIN_EMAILS="your@email.com"
# วิธี B: รันคำสั่งเลื่อนสิทธิ์
npm run db:promote-admin -- your@email.com

# 5. รัน dev server (Next.js + Socket.io)
npm run dev
```

> สมาชิกคนแรกที่สมัครตอนยังไม่มี ADMIN จะได้ role ADMIN อัตโนมัติ

> **Production:** ใช้ PostgreSQL ผ่าน `docker compose up` — ดู [docs/deployment.md](docs/deployment.md)

เปิดใช้งาน:
- แอป: http://localhost:3010
- Admin login: http://localhost:3010/admin-login (หรือ http://localhost:3010/admin)
- API docs: http://localhost:3010/admin/docs
- Health check: http://localhost:3010/api/health

> ใช้ port 3010 (แอป) และ 5434 (PostgreSQL) — ปรับได้ใน `.env` ผ่าน `PORT` และ `DATABASE_URL`

## เอกสารเพิ่มเติม

- [Socket.io events](docs/socket-events.md)
- [Deployment guide](docs/deployment.md)

## Tech Stack

- **Frontend:** Next.js 16, React 19, Material UI
- **Backend:** Next.js API Routes, custom Socket.io server
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (Credentials)
- **API Docs:** OpenAPI 3.1 + Swagger UI
