---
title: Talkto — เอกสารสรุปฟังก์ชัน
author: Talkto Team
date: 8 มิถุนายน 2026
---

# Talkto — เอกสารสรุปฟังก์ชัน

แอปพลิเคชันแชทกลุ่มและแชทส่วนตัว พัฒนาด้วย Next.js, Socket.io และ Prisma  
สไตล์ UI แบบ GoingWealth (โทนสีดำ–ทอง)

---

## 1. บัญชีผู้ใช้ (Authentication)

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| สมัครสมาชิก | หน้า `/register` — กรอกชื่อ, อีเมล, รหัสผ่าน |
| เข้าสู่ระบบ | หน้า `/login` — ระบบ NextAuth (Credentials) |
| ออกจากระบบ | ปุ่มใน sidebar ล่าง |
| บทบาท Admin | แบ่งเป็น `ADMIN` และ `USER` |
| ตั้งค่า Admin | รัน `npm run db:promote-admin -- email@example.com` หรือตั้ง `ADMIN_EMAILS` ใน `.env` |
| เข้า Admin | หน้า `/admin-login` แล้ว redirect ไป `/admin` |

---

## 2. โปรไฟล์ผู้ใช้

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| แก้ไขชื่อ | ปุ่ม "แก้ไขโปรไฟล์" ใน sidebar |
| อัปโหลด Avatar | อัปโหลดไป Cloudinary (JPEG/PNG/WebP ไม่เกิน 2MB) |
| ลบรูปโปรไฟล์ | ลบ avatar ได้ใน dialog |
| แสดง Avatar | แสดงใน sidebar, รายการแชท DM, หัวห้องแชท และข้อความในห้องสนทนา |

---

## 3. แชท — ห้องกลุ่ม (GROUP)

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| สร้างห้องกลุ่ม | แท็บ "กลุ่ม" → ปุ่มสร้างห้องกลุ่ม + ตั้งชื่อ |
| รายการห้อง | Sidebar แสดงชื่อ, จำนวนสมาชิก, ข้อความล่าสุด, unread |
| ส่งข้อความ | พิมพ์ + Enter หรือกดปุ่มส่ง |
| ส่งรูปภาพ | อัปโหลดผ่าน Cloudinary (สูงสุด 5MB, JPEG/PNG/WebP/GIF) พร้อม caption ได้ |
| แสดงจำนวนสมาชิก | ที่ header ห้องและรายการ sidebar |
| เชิญเข้ากลุ่ม | ปุ่ม "เชิญเข้ากลุ่ม" → ค้นหาชื่อ/อีเมล → ส่งคำเชิญในแชทส่วนตัว |
| รับคำเชิญ | การ์ดคำเชิญในแชท DM → กด "เข้าร่วมกลุ่ม" |
| ออกจากกลุ่ม | ปุ่ม "ออกจากกลุ่ม" พร้อมยืนยันก่อนออก |

---

## 4. แชท — ส่วนตัว (DM)

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| เริ่มแชทใหม่ | แท็บ "ส่วนตัว" → ค้นหาผู้ใช้ → เริ่มแชท |
| สถานะออนไลน์ | แสดงออนไลน์/ออฟไลน์ที่หัวแชท |
| เชิญแชทส่วนตัว | สร้างลิงก์เชิญ (หมดอายุ 7 วัน) |
| รับลิงก์เชิญ DM | หน้า `/invite/dm/[token]` |

---

## 5. ข้อความและ Real-time

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| Push ทันที | Socket.io push ไป user room — ข้อความแสดงทันที |
| Optimistic UI | ข้อความแสดงก่อน API ตอบกลับ |
| Sidebar อัปเดต | ข้อความล่าสุด, unread, ย้ายขึ้นบนสุดแบบ real-time |
| Typing indicator | แสดงเมื่ออีกฝั่งกำลังพิมพ์ |
| อ่านแล้ว (Read) | Mark read อัตโนมัติเมื่อเปิดห้อง |
| Unread badge | นับข้อความที่ยังไม่อ่าน |
| Reconnect | Auto-reconnect + โหลดข้อความที่พลาด |

---

## 6. UI / ธีม

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| ธีม GoingWealth | Primary สีดำ, Secondary สีทอง, card radius 16px |
| โลโก้ | `talktologo.png` ที่หัว sidebar |
| Favicon | `favicon.png` |
| Responsive | มือถือมี drawer sidebar |
| Light/Dark | สลับธีมได้ (ThemeRegistry) |

---

## 7. Admin Dashboard (`/admin`)

| ฟังก์ชัน | รายละเอียด |
|---------|------------|
| Dashboard | สถิติผู้ใช้, แชท, กราฟ |
| จัดการผู้ใช้ | `/admin/users` — ดูรายชื่อ, เปลี่ยน role, ลบ |
| API Docs | `/admin/docs` — OpenAPI / Swagger |
| สิทธิ์เข้าถึง | เฉพาะ role `ADMIN` |

---

## 8. API หลัก (REST)

### Authentication & Profile
- `POST /api/register` — สมัครสมาชิก
- `POST /api/auth/[...nextauth]` — เข้าสู่ระบบ
- `GET /api/users/me` — ดูโปรไฟล์
- `PATCH /api/users/me` — แก้ไขโปรไฟล์
- `GET /api/users/search` — ค้นหาผู้ใช้

### Upload
- `POST /api/uploads/image` — อัปโหลดรูปในแชท
- `POST /api/uploads/avatar` — อัปโหลดรูปโปรไฟล์

### Conversations
- `GET /api/conversations` — รายการแชท
- `POST /api/conversations` — สร้างห้องกลุ่ม
- `GET /api/conversations/[id]` — รายละเอียดห้อง
- `GET/POST /api/conversations/[id]/messages` — ข้อความ
- `POST /api/conversations/[id]/read` — mark as read
- `POST /api/conversations/[id]/leave` — ออกจากกลุ่ม
- `POST /api/conversations/[id]/invites` — สร้างลิงก์เชิญกลุ่ม
- `POST /api/conversations/[id]/invites/user` — เชิญผู้ใช้เข้ากลุ่มผ่านแชท

### DM & Invites
- `POST /api/dm` — เริ่มแชทส่วนตัว
- `GET /api/invites/[token]` — ดูรายละเอียดคำเชิญ
- `POST /api/invites/[token]/accept` — ยอมรับคำเชิญ
- `POST /api/invites/dm` — สร้างลิงก์เชิญ DM

### Admin
- `GET /api/admin/stats` — สถิติ
- `GET /api/admin/users` — รายชื่อผู้ใช้
- `PATCH/DELETE /api/admin/users/[id]` — จัดการผู้ใช้
- `GET /api/admin/openapi` — OpenAPI spec

### Health
- `GET /api/health` — ตรวจสอบสถานะระบบ

---

## 9. Socket.io Events

### Client → Server
- `conversation:join` — เข้าร่วมห้องแชท
- `conversation:leave` — ออกจากห้องแชท
- `message:send` — ส่งข้อความ
- `typing:start` / `typing:stop` — สถานะกำลังพิมพ์
- `presence:subscribe` — ติดตามสถานะออนไลน์

### Server → Client
- `message:new` — ข้อความใหม่
- `message:sent` — ยืนยันการส่ง
- `conversation:updated` — อัปเดตรายการแชท / จำนวนสมาชิก
- `typing:update` — อัปเดตสถานะพิมพ์
- `presence:update` / `presence:sync` — สถานะออนไลน์

---

## 10. โครงสร้างเทคนิค

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 16, React 19, MUI v9 |
| Backend | Custom server.ts + Socket.io |
| Database | Prisma + SQLite (dev) |
| Authentication | NextAuth (JWT session) |
| รูปภาพ | Cloudinary |
| Real-time | Socket.io (user room push) |

---

## 11. คำสั่งที่ใช้บ่อย

```bash
npm run dev              # รัน dev server (port 3010)
npm run build            # build production
npm run db:push          # sync database schema
npm run db:promote-admin -- email@example.com
```

---

## 12. การตั้งค่า Environment (`.env`)

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `DATABASE_URL` | SQLite หรือ PostgreSQL |
| `NEXTAUTH_SECRET` | Secret สำหรับ session |
| `NEXTAUTH_URL` | URL ของแอป เช่น `http://localhost:3010` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_EMAILS` | (optional) อีเมลที่ได้สิทธิ์ Admin ตอนสมัคร |
| `PORT` | พอร์ต server (default 3010) |

---

*เอกสารนี้สรุปฟังก์ชันทั้งหมดของ Talkto ณ วันที่จัดทำ*
