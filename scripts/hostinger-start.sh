#!/bin/sh
set -e

export NODE_ENV="${NODE_ENV:-production}"
export HOSTINGER="${HOSTINGER:-1}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

exec npx tsx server.ts
