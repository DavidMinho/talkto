#!/bin/sh
set -e

echo "=== Talkto container start ==="
echo "PORT=${PORT:-unset}"
echo "NODE_ENV=${NODE_ENV:-unset}"
echo "NEXTAUTH_URL=${NEXTAUTH_URL:-unset}"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "ERROR: NEXTAUTH_SECRET is not set"
  exit 1
fi

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "ERROR: prisma migrate deploy failed"
  exit 1
fi

echo "Starting Talkto on port ${PORT:-3010}..."
exec npx tsx server.ts
