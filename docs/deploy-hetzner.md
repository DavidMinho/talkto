# Deploy Talkto บน Hetzner Cloud

เหมาะกับ Talkto (Node + Socket.io + PostgreSQL) มากกว่า shared hosting

## สิ่งที่ต้องมี

| รายการ | แนะนำ |
|--------|--------|
| Hetzner VPS | CX22 (2 vCPU / 4 GB) หรือ CX11 ถ้าใช้ Neon |
| OS | Ubuntu 24.04 |
| Domain | ชี้ A record ไป IP ของ VPS |
| Database | Neon PostgreSQL (แนะนำ) หรือ Postgres บน VPS |

---

## วิธีที่ 1 — รันบนเซิร์ฟเวอร์ (ง่ายสุด)

1. สร้าง Hetzner Cloud Server → Ubuntu 24.04 → เพิ่ม SSH key
2. SSH เข้าเซิร์ฟเวอร์:

```bash
ssh root@YOUR_SERVER_IP
```

3. รันสคริปต์ติดตั้ง:

```bash
curl -fsSL https://raw.githubusercontent.com/DavidMinho/talkto/main/scripts/deploy-hetzner.sh | bash
```

4. แก้ไฟล์ env แล้ว deploy อีกครั้ง:

```bash
nano /opt/talkto/.env
cd /opt/talkto && bash scripts/deploy-hetzner.sh
```

คัดลอกค่าจาก Mac:

```bash
cat hetzner.env.deploy   # สร้างจาก hetzner.env.example
```

5. ตั้ง `DOMAIN` และ `NEXTAUTH_URL=https://your-domain.com` ใน `.env`

---

## วิธีที่ 2 — Deploy จาก Mac (มี SSH)

```bash
# สร้าง hetzner.env.deploy จาก hetzner.env.example แล้วใส่ค่าจริง
HETZNER_HOST=YOUR_SERVER_IP \
DOMAIN=talkto.example.com \
bash scripts/hetzner-remote-deploy.sh
```

---

## วิธีที่ 3 — Docker + Caddy (HTTPS อัตโนมัติ)

บนเซิร์ฟเวอร์:

```bash
cd /opt/talkto
# .env ต้องมี DOMAIN และ NEXTAUTH_URL=https://DOMAIN
DEPLOY_MODE=docker bash scripts/deploy-hetzner.sh
```

---

## ตัวแปรใน `.env`

| ตัวแปร | ตัวอย่าง |
|--------|---------|
| `DOMAIN` | `talkto.example.com` |
| `DATABASE_URL` | `postgresql://...@....neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | `https://talkto.example.com` |
| `CLOUDINARY_*` | จาก Cloudinary dashboard |

---

## ทดสอบ

```bash
curl https://YOUR_DOMAIN/api/health
# ต้องได้ "db":"connected", "auth":"configured"
```

```bash
pm2 logs talkto          # โหมด PM2
docker compose -f docker-compose.hetzner.yml logs -f app   # โหมด Docker
```

---

## อัปเดตเวอร์ชัน

```bash
cd /opt/talkto
git pull
npm ci && npm run build && npx prisma migrate deploy
pm2 restart talkto
```

หรือ Docker:

```bash
cd /opt/talkto && git pull
docker compose -f docker-compose.hetzner.yml up -d --build
```
