#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Talkto..."
exec npx tsx server.ts
