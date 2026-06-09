#!/bin/sh
set -e

cd "$(dirname "$0")/.." || exit 1

echo "=== Talkto Hostinger prestart ==="
echo "Working directory: $(pwd)"

strip_quotes() {
  printf '%s' "$1" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

if [ -f .env ]; then
  echo "Loading .env file..."
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

for key in DATABASE_URL NEXTAUTH_SECRET AUTH_SECRET NEXTAUTH_URL CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET ADMIN_EMAILS; do
  eval "val=\${$key:-}"
  if [ -n "$val" ]; then
    cleaned=$(strip_quotes "$val")
    eval "export $key=\$cleaned"
  fi
done

missing=""
[ -z "${DATABASE_URL:-}" ] && missing="$missing DATABASE_URL"
if [ -z "${NEXTAUTH_SECRET:-}" ] && [ -z "${AUTH_SECRET:-}" ]; then
  missing="$missing NEXTAUTH_SECRET"
fi
[ -z "${NEXTAUTH_URL:-}" ] && missing="$missing NEXTAUTH_URL"

if [ -n "$missing" ]; then
  echo "ERROR: Missing env:$missing"
  echo "Fix: hPanel → Environment variables → Import .env (see hostinger.env.deploy)"
  exit 1
fi

export NODE_ENV="${NODE_ENV:-production}"
export HOSTINGER="${HOSTINGER:-1}"

echo "Persisting production .env for Next.js runtime..."
node scripts/write-production-env.mjs

if [ -n "${DATABASE_URL:-}" ]; then
  db_host=$(printf '%s' "$DATABASE_URL" | sed -E 's#^[^@]+@([^/:?]+).*#\1#')
  echo "DATABASE_URL host: ${db_host:-unknown}"
else
  echo "DATABASE_URL host: (not set)"
fi

cp prisma/schema.postgresql.prisma prisma/schema.prisma
./node_modules/.bin/prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  ./node_modules/.bin/prisma migrate deploy || echo "WARN: migrate deploy failed at start"
else
  echo "ERROR: DATABASE_URL missing at start"
  exit 1
fi

echo "=== Prestart OK ==="
