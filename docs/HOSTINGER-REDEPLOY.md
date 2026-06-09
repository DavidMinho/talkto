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

---

## 2. Build & Start settings

| ช่อง | ค่า |
|------|-----|
| Node.js | **20** |
| Output directory | *(ว่าง หรือ `.next`)* |
| Entry file | *(ว่าง — ใช้ Start command ด้านล่าง)* |
| Build command | `npm ci --ignore-scripts && npm run build:hostinger` |
| Start command | `npm run start:hostinger` |

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
| `/api/health` | `"db":"connected"` |
| `/talktologo.png` | 200 |
| `/login` | หน้า login + โลโก้ PNG |
| `/api/auth/session` | `{}` ไม่ error |

---

## ถ้า 503

- Log มี `Missing env` → ทำขั้น 1 ใหม่ (Import .env)
- Log มี `prisma migrate failed` → ตรวจ `DATABASE_URL`
