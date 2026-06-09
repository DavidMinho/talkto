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

cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate
npx prisma migrate deploy

echo "=== Prestart OK ==="
