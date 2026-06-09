#!/bin/sh
set -e

echo "=== Talkto Hostinger prestart ==="

if [ -f .env ]; then
  echo "Loading .env file..."
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

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
npx prisma generate
npx prisma migrate deploy

echo "=== Prestart OK ==="
