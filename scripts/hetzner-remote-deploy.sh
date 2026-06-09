#!/bin/bash
# Run from your Mac to deploy Talkto to a Hetzner VPS
# Usage:
#   HETZNER_HOST=1.2.3.4 DOMAIN=talkto.example.com bash scripts/hetzner-remote-deploy.sh
set -euo pipefail

HETZNER_HOST="${HETZNER_HOST:?Set HETZNER_HOST to your server IPv4}"
HETZNER_USER="${HETZNER_USER:-root}"
HETZNER_PORT="${HETZNER_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_goingwealth}"
DOMAIN="${DOMAIN:-}"
DEPLOY_MODE="${DEPLOY_MODE:-pm2}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -p "$HETZNER_PORT")
if [ -f "$SSH_KEY" ]; then
  SSH_OPTS+=(-i "$SSH_KEY")
fi

echo "=== Uploading .env to Hetzner ($HETZNER_USER@$HETZNER_HOST) ==="
if [ -f "$REPO_ROOT/hetzner.env.deploy" ]; then
  scp "${SSH_OPTS[@]}" "$REPO_ROOT/hetzner.env.deploy" \
    "$HETZNER_USER@$HETZNER_HOST:/opt/talkto/.env" 2>/dev/null || \
  scp "${SSH_OPTS[@]}" "$REPO_ROOT/hetzner.env.deploy" \
    "$HETZNER_USER@$HETZNER_HOST:/tmp/talkto.env"
else
  echo "WARN: hetzner.env.deploy not found — create from hetzner.env.example"
fi

echo "=== Running deploy script on server ==="
ssh "${SSH_OPTS[@]}" "$HETZNER_USER@$HETZNER_HOST" bash -s <<EOF
set -euo pipefail
export DOMAIN="${DOMAIN}"
export DEPLOY_MODE="${DEPLOY_MODE}"
if [ -f /tmp/talkto.env ]; then
  mkdir -p /opt/talkto
  mv /tmp/talkto.env /opt/talkto/.env
fi
if [ ! -d /opt/talkto/.git ]; then
  curl -fsSL https://raw.githubusercontent.com/DavidMinho/talkto/main/scripts/deploy-hetzner.sh | bash
else
  cd /opt/talkto && git pull && bash scripts/deploy-hetzner.sh
fi
EOF

echo "=== Done ==="
if [ -n "$DOMAIN" ]; then
  echo "Check: https://$DOMAIN/api/health"
else
  echo "Check: http://$HETZNER_HOST/api/health"
fi
