#!/bin/sh
set -e

cd "$(dirname "$0")/.." || exit 1

export NODE_ENV="${NODE_ENV:-production}"
export HOSTINGER="${HOSTINGER:-1}"

if command -v node >/dev/null 2>&1; then
  node scripts/write-production-env.mjs || true
fi

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

exec ./node_modules/.bin/tsx server.ts
