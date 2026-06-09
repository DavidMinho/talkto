# Deploy Talkto บน Hostinger Node.js Web App (techfloy.com)

## ตั้งค่าใน hPanel

**Websites → Node.js Web App → Settings / Environment**

### Build & Start

| ช่อง | ค่า |
|------|-----|
| Node.js | **20** |
| Entry file | `server.ts` |
| Build command | `npm ci --ignore-scripts && npm run build:hostinger` |
| Start command | `npm run start:hostinger` |

### Environment variables (ครบทุกตัว)

คัดลอกจากไฟล์ `hostinger.env.deploy` บน Mac (หนึ่งบรรทัด = หนึ่งตัวแปร)

| ตัวแปร | ตัวอย่าง |
|--------|---------|
| `DATABASE_URL` | `postgresql://...@....neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | สตริงยาว random |
| `NEXTAUTH_URL` | `https://techfloy.com` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | จาก Cloudinary |
| `CLOUDINARY_API_KEY` | จาก Cloudinary |
| `CLOUDINARY_API_SECRET` | จาก Cloudinary |
| `ADMIN_EMAILS` | (optional) |

**สำคัญ:** ใน Hostinger ใส่แค่ `ชื่อ=ค่า` ไม่ต้องมี `"` รอบค่า

---

## Deploy & ทดสอบ

1. Save env → **Redeploy**
2. ดู Deployment log ต้องเห็น `Talkto ready on...`
3. `https://techfloy.com/api/health` → `"db":"connected"`
4. `https://techfloy.com/login` → สมัครสมาชิก → ทดสอบแชท

---

## Troubleshooting

| อาการ | แก้ |
|-------|-----|
| `db: disconnected` | ตรวจ `DATABASE_URL` + redeploy |
| NextAuth config error | ตรวจ `NEXTAUTH_SECRET` + `NEXTAUTH_URL` |
| หน้าแรก 500 | เปิด `/login` ก่อน — หลังแก้ env จะหาย |
| แชทไม่ realtime | ข้อจำกัด Web Hosting — ลอง refresh หรือใช้ VPS |
