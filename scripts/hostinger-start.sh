#!/bin/sh
set -e

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

export NODE_ENV="${NODE_ENV:-production}"
exec npx tsx server.ts
