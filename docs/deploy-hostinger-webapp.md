# Deploy Talkto บน Hostinger Node.js Web App

สำหรับ **Web Hosting Plan** ที่มีตัวเลือก **Node.js Web App** (Business ขึ้นไป)

> **หมายเหตุ:** แชท realtime (Socket.io) อาจไม่เสถียรบน managed hosting — ถ้าไม่ทำงาน ต้องใช้ VPS หรือ Render

---

## 1. สร้าง Node.js Web App

1. hPanel → **Websites** → **Add website**
2. เลือก **Node.js Web App**
3. **Import Git Repository** → Authorize GitHub → เลือก `DavidMinho/talkto`

---

## 2. ตั้งค่า Build & Start

| ช่อง | ค่า |
|------|-----|
| Node.js version | **20** |
| Framework | Other / Express (ถ้าเลือกได้) |
| Entry file | `server.ts` |
| Build command | `npm ci && npm run build:hostinger` |
| Start command | `npm run start:hostinger` |

---

## 3. Environment Variables

| ตัวแปร | ค่า |
|--------|-----|
| `DATABASE_URL` | Neon PostgreSQL connection string (`?sslmode=require`) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL จริงหลัง deploy เช่น `https://talkto.techfloy.com` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | จาก Cloudinary |
| `CLOUDINARY_API_KEY` | จาก Cloudinary |
| `CLOUDINARY_API_SECRET` | จาก Cloudinary |
| `ADMIN_EMAILS` | (optional) อีเมล admin |

---

## 4. Deploy

กด **Deploy** → รอ build เสร็จ → เปิด URL ที่ Hostinger ให้

หลังรู้ URL จริง:
1. แก้ `NEXTAUTH_URL` ให้ตรง URL
2. **Redeploy**

ทดสอบ: `https://YOUR-URL/api/health` → ต้องได้ `"db":"connected"`

ถ้าได้ `"db":"disconnected"` หรือหน้าแรก error 500 → ตรวจ `DATABASE_URL` และ `NEXTAUTH_SECRET` ใน Environment แล้ว Redeploy

**ทดสอบเร็ว:** เปิด `https://techfloy.com/login` ก่อน (หน้า login มักโหลดได้แม้ DB ยังไม่ต่อ)

---

## 5. ใช้ subdomain กับ techfloy.com (optional)

1. hPanel → Domains → สร้าง subdomain `talkto.techfloy.com`
2. ชี้ subdomain ไปที่ Node.js Web App
3. ตั้ง `NEXTAUTH_URL=https://talkto.techfloy.com` แล้ว redeploy

---

## Troubleshooting

| อาการ | แก้ |
|-------|-----|
| Build fail Prisma | ใช้ `build:hostinger` (สลับ schema เป็น PostgreSQL) |
| Login redirect ผิด | แก้ `NEXTAUTH_URL` |
| แชทไม่ realtime | ข้อจำกัด hosting — ใช้ VPS/Render |
| DB error | ตรวจ `DATABASE_URL` จาก Neon |
