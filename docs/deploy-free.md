# Deploy Talkto ฟรี — Render + Neon

Talkto ใช้ **custom server + Socket.io** จึงต้อง deploy บน Web Service (ไม่ใช่ Vercel serverless)

ใช้ **Render (ฟรี)** + **Neon PostgreSQL (ฟรี)** — ดู template env ที่ `env.render.example`

---

## ขั้นที่ 1 — สร้าง Database (Neon)

1. เปิด [console.neon.tech](https://console.neon.tech) → สมัคร / ล็อกอิน (GitHub ได้)
2. **New Project** → ตั้งชื่อ `talkto` → region **Singapore** หรือ **AWS ap-southeast-1** ถ้ามี
3. ไปที่ **Dashboard → Connection Details**
4. เลือก **Direct connection** (สำคัญ — ใช้กับ `prisma migrate deploy`)
5. คัดลอก connection string แบบ `postgresql://...` ให้มี `?sslmode=require` ท้าย URL
6. เก็บไว้ — จะใส่ใน Render เป็น `DATABASE_URL`

---

## ขั้นที่ 2 — Push โค้ดขึ้น GitHub

```bash
cd /Users/davidminho/CloudEx/CloudWorks/Dev/Talkto
git init -b main
git add -A
git commit -m "Prepare Talkto for Render deploy"
```

สร้าง repo บน GitHub (เว็บ):

1. [github.com/new](https://github.com/new) → ชื่อ `talkto` → **Private** หรือ Public → สร้าง
2. อย่าเลือก README / .gitignore (มีในโปรเจกต์แล้ว)

```bash
git remote add origin https://github.com/YOUR_GITHUB_USER/talkto.git
git push -u origin main
```

---

## ขั้นที่ 3 — Deploy บน Render (Blueprint)

1. เปิด [dashboard.render.com](https://dashboard.render.com) → ล็อกอิน
2. **New +** → **Blueprint**
3. **Connect GitHub** → เลือก repo `talkto`
4. Render อ่าน `render.yaml` แล้วถามค่า env — ใส่ตามนี้:

| ตัวแปร | ค่า |
|--------|-----|
| `DATABASE_URL` | connection string จาก Neon (ขั้นที่ 1) |
| `NEXTAUTH_URL` | ใส่ `https://talkto.onrender.com` ชั่วคราวก่อน deploy ได้ — **แก้เป็น URL จริงหลัง deploy เสร็จ** |
| `NEXTAUTH_SECRET` | กด Generate หรือ `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | จาก Cloudinary |
| `CLOUDINARY_API_KEY` | จาก Cloudinary |
| `CLOUDINARY_API_SECRET` | จาก Cloudinary |
| `ADMIN_EMAILS` | (optional) อีเมล admin คั่นด้วย comma |

5. กด **Apply** — รอ build ครั้งแรก ~5–10 นาที

---

## ขั้นที่ 4 — หลัง deploy สำเร็จ

1. คัดลอก URL จริง เช่น `https://talkto-xxxx.onrender.com`
2. Render → **Environment** → แก้ `NEXTAUTH_URL` ให้ตรง URL จริง → **Save** (จะ redeploy อัตโนมัติ)
3. เปิด `https://YOUR-APP.onrender.com/api/health` → ต้องได้ `"status":"ok"`
4. เปิดแอป → สมัครสมาชิก → ทดสอบแชท / ส่งรูป

---

## ลำดับทำซ้ำถ้า deploy ใหม่

```
Neon (DB) → GitHub (repo) → Render (Blueprint) → แก้ NEXTAUTH_URL → ทดสอบ /api/health
```

## ข้อจำกัด Free tier

- **Render free**: แอป sleep หลัง ~15 นาทีไม่มี traffic — เปิดครั้งแรกอาจรอ 30–60 วินาที
- **Neon free**: จำกัด storage / compute — พอสำหรับทดสอบ
- **Socket.io**: ทำงานได้บน Render เพราะเป็น persistent process

## ทางเลือกอื่น (ฟรี)

### Docker บนเครื่อง (ถ้ามี Docker)

```bash
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
export NEXTAUTH_URL=http://localhost:3010
docker compose up --build
```

### Cloudflare Tunnel (เปิด localhost ให้คนอื่นเข้าได้ชั่วคราว)

```bash
npm run dev
# terminal อื่น:
cloudflared tunnel --url http://localhost:3010
```

ตั้ง `NEXTAUTH_URL` เป็น URL ที่ cloudflared ให้

## Troubleshooting

| อาการ | แก้ |
|-------|-----|
| Health check fail | ตรวจ `DATABASE_URL` และ Neon เปิด SSL |
| Login redirect ผิด | `NEXTAUTH_URL` ต้องตรงกับ URL จริง (https) |
| รูปส่งไม่ได้ | ตรวจ Cloudinary env |
| Build fail Prisma | ใช้ PostgreSQL connection string ไม่ใช่ SQLite |
