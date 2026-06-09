#!/bin/sh
set -e

cd "$(dirname "$0")/.." || exit 1

echo "=== Talkto Hostinger build ==="
echo "Working directory: $(pwd)"

strip_quotes() {
  printf '%s' "$1" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

if [ -f .env ]; then
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

echo "Persisting env files for runtime..."
node scripts/write-production-env.mjs

cp prisma/schema.postgresql.prisma prisma/schema.prisma
./node_modules/.bin/prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running prisma migrate deploy at build time..."
  ./node_modules/.bin/prisma migrate deploy || echo "WARN: migrate deploy failed at build (will retry at start)"
else
  echo "WARN: DATABASE_URL not set at build — migrate skipped"
fi

./node_modules/.bin/next build

echo "=== Build OK ==="
