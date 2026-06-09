#!/bin/sh
set -e

cd "$(dirname "$0")/.." || exit 1

echo "=== Talkto Hostinger build ==="

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

cp prisma/schema.postgresql.prisma prisma/schema.prisma
./node_modules/.bin/prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running prisma migrate deploy at build time..."
  ./node_modules/.bin/prisma migrate deploy || echo "WARN: migrate deploy failed at build (will retry at start)"
else
  echo "WARN: DATABASE_URL not set at build — skipping migrate"
fi

./node_modules/.bin/next build

echo "=== Build OK ==="
