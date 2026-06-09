# Hostinger Redeploy — techfloy.com (ทำตามลำดับ)

## 1. Import Environment (สำคัญที่สุด)

hPanel → Node.js App → **Deployments → Settings → Environment variables**

กด **Import .env** แล้ววางเนื้อหาจากไฟล์บน Mac:

```bash
cat /Users/davidminho/CloudEx/CloudWorks/Dev/Talkto/hostinger.env.deploy
```

ต้องมีครบ (ค่าที่มี `+` `/` `=` ต้องใส่เครื่องหมาย `"` ครอบ):
- `DATABASE_URL`
- `NEXTAUTH_SECRET` และ `AUTH_SECRET` (ค่าเดียวกัน)
- `NEXTAUTH_URL=https://techfloy.com`
- `NODE_ENV=production`
- `CLOUDINARY_*`

กด **Save** แล้วตรวจว่า `NEXTAUTH_SECRET` ไม่ถูกตัดท้าย

ถ้า Import ไม่ได้ ให้เพิ่มทีละตัวใน hPanel (ชื่อตัวแปรต้องตรงเป๊ะ):

| Name | Value |
|------|-------|
| `DATABASE_URL` | connection string จาก Neon |
| `NEXTAUTH_SECRET` | ค่า secret (ใส่ `"..."` ครอบถ้ามีอักขระพิเศษ) |
| `AUTH_SECRET` | ค่าเดียวกับ `NEXTAUTH_SECRET` |
| `NEXTAUTH_URL` | `https://techfloy.com` |
| `NODE_ENV` | `production` |

Build/Start log ต้อง **ไม่** ขึ้น `Missing: NEXTAUTH_SECRET`

---

## 2. Build & Start settings

| ช่อง | ค่า |
|------|-----|
| Node.js | **20** |
| Output directory | *(ว่าง หรือ `.next`)* |
| Entry file | *(ว่าง — ใช้ Start command ด้านล่าง)* |
| Build command | `npm ci --ignore-scripts && npm run build:hostinger` |
| Root directory | โฟลเดอร์ที่มี `package.json` (มักเป็น repo root) |
| Start command | `npm start` หรือ `npm run start:hostinger` |

---

## 3. Redeploy

กด **Redeploy** → รอจบ → ดู Log ต้องเห็น:

```
=== Talkto Hostinger prestart ===
=== Prestart OK ===
> Talkto ready on http://0.0.0.0:...
```

---

## 4. ทดสอบ

| URL | ผลที่ต้องการ |
|-----|-------------|
| `/api/health` | `"db":"connected"`, `"auth":"configured"`, `"env":"database-url-set"` |
| `/talktologo.png` | 200 |
| `/login` | หน้า login + โลโก้ PNG |
| `/api/auth/session` | `{}` ไม่ error |

---

## ถ้า Server error / NextAuth config error

- `/api/health` แสดง `"auth":"missing-secret"` → Import `.env` ใหม่ (ดู `NEXTAUTH_SECRET` + `AUTH_SECRET`)
- `/api/health` แสดง `"env":"database-url-missing"` → ตรวจ `DATABASE_URL` ใน Environment
- Log ต้องเห็น `Wrote .env with ... variables` หลัง prestart

## ถ้า 503

- Log มี `Missing env` → ทำขั้น 1 ใหม่ (Import .env)
- Log มี `prisma migrate failed` → ตรวจ `DATABASE_URL`
