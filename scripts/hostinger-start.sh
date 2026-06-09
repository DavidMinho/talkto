#!/bin/sh
set -e

echo "=== Talkto Hostinger start ==="

missing=""
[ -z "${DATABASE_URL:-}" ] && missing="$missing DATABASE_URL"
[ -z "${NEXTAUTH_SECRET:-}" ] && missing="$missing NEXTAUTH_SECRET"
[ -z "${NEXTAUTH_URL:-}" ] && missing="$missing NEXTAUTH_URL"

if [ -n "$missing" ]; then
  echo "ERROR: Missing env:$missing"
  exit 1
fi

echo "NEXTAUTH_URL=$NEXTAUTH_URL"
echo "PORT=${PORT:-unset}"

cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate
npx prisma migrate deploy

exec npx tsx server.ts
