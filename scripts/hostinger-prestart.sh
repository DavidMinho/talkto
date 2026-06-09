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

for key in DATABASE_URL DB_HOST DB_USER DB_PASSWORD DB_NAME NEXTAUTH_SECRET AUTH_SECRET NEXTAUTH_URL CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET ADMIN_EMAILS; do
  eval "val=\${$key:-}"
  if [ -n "$val" ]; then
    cleaned=$(strip_quotes "$val")
    eval "export $key=\$cleaned"
  fi
done

missing=""
if [ -z "${DATABASE_URL:-}" ] && { [ -z "${DB_HOST:-}" ] || [ -z "${DB_USER:-}" ] || [ -z "${DB_PASSWORD:-}" ]; }; then
  missing="$missing DATABASE_URL(or DB_HOST/DB_USER/DB_PASSWORD)"
fi
if [ -z "${NEXTAUTH_SECRET:-}" ] && [ -z "${AUTH_SECRET:-}" ]; then
  missing="$missing NEXTAUTH_SECRET"
fi
[ -z "${NEXTAUTH_URL:-}" ] && missing="$missing NEXTAUTH_URL"

if [ -n "$missing" ]; then
  echo "WARN: Missing env in shell:$missing"
  echo "Continuing — hPanel may inject env at Node runtime."
else
  echo "Shell env looks complete."
fi

export NODE_ENV="${NODE_ENV:-production}"
export HOSTINGER="${HOSTINGER:-1}"

echo "Persisting production .env when available..."
node scripts/write-production-env.mjs || echo "WARN: could not write .env files"

if [ -n "${DATABASE_URL:-}" ]; then
  db_host=$(printf '%s' "$DATABASE_URL" | sed -E 's#^[^@]+@([^/:?]+).*#\1#')
  echo "DATABASE_URL host: ${db_host:-unknown}"
elif [ -n "${DB_HOST:-}" ]; then
  echo "DATABASE_URL host: ${DB_HOST} (from DB_HOST)"
else
  echo "DATABASE_URL host: (not set in shell)"
fi

cp prisma/schema.postgresql.prisma prisma/schema.prisma
./node_modules/.bin/prisma generate

if [ -n "${DATABASE_URL:-}" ] || [ -n "${DB_HOST:-}" ]; then
  ./node_modules/.bin/prisma migrate deploy || echo "WARN: migrate deploy failed at start"
else
  echo "WARN: skipping migrate (no DB env in shell)"
fi

echo "=== Prestart OK ==="
