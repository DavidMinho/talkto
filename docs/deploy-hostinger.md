# Deploy Talkto บน Hostinger

Talkto ต้องการ **Node.js + Socket.io + process รันตลอด** — ใช้ได้กับ:

- **VPS** (แนะนำ) — รองรับครบ รวม WebSocket
- **Node.js Web App** — ลองได้ แต่ Socket.io อาจไม่เสถียร

Shared hosting ทั่วไป **ใช้ไม่ได้**

Database ใช้ **Neon PostgreSQL** (ฟรี) เหมือน Render — ไม่ต้องติดตั้ง Postgres บน Hostinger

---

## ก่อนเริ่ม — เช็คใน hPanel

ล็อกอิน [hpanel.hostinger.com](https://hpanel.hostinger.com) แล้วดูว่ามีเมนูไหน:

| เห็นใน hPanel | แปลว่า |
|---------------|--------|
| **VPS** → Manage → SSH / Terminal | ใช้วิธี VPS (ด้านล่าง) |
| **Websites → Add website → Node.js Web App** | ใช้วิธี Node.js Web App |
| แค่ Websites + File Manager (PHP) | Shared — ต้องอัปเกรด |

---

## วิธี A — VPS (แนะนำ)

### 1. เตรียม VPS

- Ubuntu 24.04
- เปิด SSH (hPanel → VPS → SSH access)
- ชี้ domain มาที่ IP VPS (หรือใช้ temporary domain ก่อน)

### 2. SSH เข้าเซิร์ฟเวอร์

```bash
ssh root@YOUR_VPS_IP
```

### 3. ติดตั้ง Node.js 20 + PM2 + Nginx

```bash
apt update && apt install -y curl nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

### 4. Clone โปรเจกต์

```bash
cd /var/www
git clone https://github.com/DavidMinho/talkto.git
cd talkto
```

### 5. ตั้ง Environment

```bash
nano .env
```

ใส่ค่า (ตัวอย่าง):

```env
DATABASE_URL="postgresql://...@....neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.com"
PORT=3010
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
ADMIN_EMAILS="your@email.com"
```

ใช้ schema PostgreSQL สำหรับ production:

```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npm ci
npm run build
npx prisma migrate deploy
```

### 6. รันด้วย PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 7. ตั้ง Nginx (รองรับ Socket.io)

```bash
cp scripts/hostinger-nginx.conf.example /etc/nginx/sites-available/talkto
nano /etc/nginx/sites-available/talkto
# แก้ your-domain.com และ port 3010 ถ้าต่าง
ln -s /etc/nginx/sites-available/talkto /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

SSL ฟรี:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 8. ทดสอบ

- `https://your-domain.com/api/health`
- สมัครสมาชิก → ทดสอบแชท realtime

---

## วิธี B — Node.js Web App (hPanel)

1. **Websites → Add website → Node.js Web App**
2. **Import Git Repository** → เลือก `DavidMinho/talkto`
3. ตั้งค่า:

| ช่อง | ค่า |
|------|-----|
| Node.js version | 20 |
| Build command | `cp prisma/schema.postgresql.prisma prisma/schema.prisma && npm ci && npm run build` |
| Start command | `npm run start:prod` |
| Entry file | `server.ts` (ถ้ามีให้เลือก) |

4. **Environment Variables** — ใส่เหมือน `.env` ด้านบน  
   `NEXTAUTH_URL` = URL จริงของเว็บบน Hostinger

5. **Deploy** → ดู Deployment log

ถ้าแชท realtime ไม่ทำงาน → ย้ายไป VPS

---

## อัปเดตโค้ดครั้งถัดไป

**VPS:**
```bash
cd /var/www/talkto
git pull
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npm ci && npm run build
npx prisma migrate deploy
pm2 restart talkto
```

**Node.js Web App:** push ขึ้น GitHub → Hostinger redeploy อัตโนมัติ

---

## Troubleshooting

| อาการ | แก้ |
|-------|-----|
| 502 Bad Gateway | `pm2 logs talkto` — ตรวจ PORT ตรงกับ Nginx |
| Login redirect ผิด | `NEXTAUTH_URL` ต้องเป็น https + domain จริง |
| แชทไม่ realtime | ตรวจ Nginx `/socket.io/` upgrade headers |
| DB error | ตรวจ `DATABASE_URL` + `sslmode=require` |
