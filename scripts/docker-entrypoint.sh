#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "ERROR: NEXTAUTH_SECRET is not set"
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Talkto on port ${PORT:-10000}..."
exec npx tsx server.ts
