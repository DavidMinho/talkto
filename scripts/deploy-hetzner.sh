#!/bin/bash
# Talkto on Hetzner Cloud VPS (Ubuntu 22.04/24.04)
# Run as root on a fresh server:
#   curl -fsSL https://raw.githubusercontent.com/DavidMinho/talkto/main/scripts/deploy-hetzner.sh | bash
# Or with domain:
#   DOMAIN=talkto.example.com bash scripts/deploy-hetzner.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/talkto}"
APP_PORT="${APP_PORT:-3010}"
REPO_URL="${REPO_URL:-https://github.com/DavidMinho/talkto.git}"
DEPLOY_MODE="${DEPLOY_MODE:-pm2}"
DOMAIN="${DOMAIN:-}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash scripts/deploy-hetzner.sh"
  exit 1
fi

echo "=== Talkto Hetzner deploy (mode: $DEPLOY_MODE) ==="

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx openssl ca-certificates ufw

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

if [ "$DEPLOY_MODE" = "docker" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
  fi
  apt-get install -y docker-compose-plugin
else
  if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
  npm install -g pm2
fi

mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

cp prisma/schema.postgresql.prisma prisma/schema.prisma

if [ ! -f .env ]; then
  cp hetzner.env.example .env
  SERVER_IP="$(curl -fsSL https://ipv4.icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')"
  sed -i "s|talkto.example.com|${DOMAIN:-$SERVER_IP}|g" .env
  sed -i "s|https://talkto.example.com|http://${DOMAIN:-$SERVER_IP}|g" .env
  echo ""
  echo ">>> Created $APP_DIR/.env — EDIT DATABASE_URL and secrets, then re-run:"
  echo "    cd $APP_DIR && bash scripts/deploy-hetzner.sh"
  exit 0
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ -z "${DATABASE_URL:-}" ] || [ -z "${NEXTAUTH_SECRET:-}" ]; then
  echo "ERROR: Set DATABASE_URL and NEXTAUTH_SECRET in $APP_DIR/.env"
  exit 1
fi

if [ -z "$DOMAIN" ]; then
  DOMAIN="$(grep '^DOMAIN=' .env | cut -d= -f2- | tr -d '"' || true)"
fi

if [ "$DEPLOY_MODE" = "docker" ]; then
  if [ -z "$DOMAIN" ]; then
    echo "ERROR: Set DOMAIN in .env for Docker + Caddy HTTPS"
    exit 1
  fi
  export DOMAIN
  docker compose -f docker-compose.hetzner.yml up -d --build
  echo "=== Docker deploy done ==="
  echo "Site: https://$DOMAIN"
  echo "Health: https://$DOMAIN/api/health"
  exit 0
fi

npm ci
npm run build
npx prisma migrate deploy

pm2 delete talkto 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

NGINX_SITE="/etc/nginx/sites-available/talkto"
SERVER_NAME="${DOMAIN:-_}"
sed "s/DOMAIN_PLACEHOLDER/${SERVER_NAME}/g; s/3010/${APP_PORT}/g" \
  scripts/hetzner-nginx.conf.example > "$NGINX_SITE"
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/talkto
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "_" ]; then
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}" || true
  if grep -q "https://" .env; then
    :
  else
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${DOMAIN}|" .env
    pm2 restart talkto
  fi
fi

SERVER_IP="$(curl -fsSL https://ipv4.icanhazip.com 2>/dev/null || echo localhost)"
echo "=== PM2 deploy done ==="
echo "Health: http://${DOMAIN:-$SERVER_IP}/api/health"
echo "Logs: pm2 logs talkto"
