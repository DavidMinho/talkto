#!/bin/bash
# รันบน Hostinger VPS (root) ผ่าน hPanel → VPS → Browser terminal
# หรือ: bash <(curl -fsSL ...) หลัง clone repo
set -euo pipefail

APP_DIR="/var/www/talkto"
APP_PORT="${APP_PORT:-3010}"
REPO_URL="${REPO_URL:-https://github.com/DavidMinho/talkto.git}"

echo "=== Talkto VPS deploy ==="

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (or use sudo)"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx openssl ca-certificates

if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

mkdir -p /var/www
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git pull
fi

cd "$APP_DIR"
cp prisma/schema.postgresql.prisma prisma/schema.prisma

if [ ! -f .env ]; then
  echo "Creating .env template — EDIT BEFORE STARTING!"
  cat > .env <<'ENVEOF'
DATABASE_URL="postgresql://USER:PASS@HOST/neondb?sslmode=require"
NEXTAUTH_SECRET="CHANGE_ME"
NEXTAUTH_URL="http://145.223.108.183"
PORT=3010
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
ADMIN_EMAILS=""
ENVEOF
  echo ">>> Edit $APP_DIR/.env then run: cd $APP_DIR && npm ci && npm run build && npx prisma migrate deploy && pm2 start ecosystem.config.cjs"
  exit 0
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

npm ci
npm run build
npx prisma migrate deploy

pm2 delete talkto 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

NGINX_SITE="/etc/nginx/sites-available/talkto"
if [ ! -f "$NGINX_SITE" ]; then
  sed "s/your-domain.com/145.223.108.183/g; s/3010/${APP_PORT}/g" \
    scripts/hostinger-nginx.conf.example > "$NGINX_SITE"
  ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/talkto
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

echo "=== Done ==="
echo "Health: http://145.223.108.183/api/health"
echo "PM2: pm2 logs talkto"
