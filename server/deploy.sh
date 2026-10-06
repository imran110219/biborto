#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Missing server/.env. Copy .env.example and fill in deployment settings." >&2
  exit 1
fi

docker compose pull web
docker compose up -d --remove-orphans
docker compose ps
