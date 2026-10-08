#!/usr/bin/env sh
# One-time setup of an EMPTY production database: schema + core data (disciplines, countries, the
# member roster, default settings) + the bootstrap superadmin. Run it once, before the first
# ./deploy.sh. It runs inside the app image (which carries the SQL), so the server needs only Docker.
#
# Reads server/.env: DATABASE_URL and SUPERADMIN_PASSWORD (8+ characters) are required;
# SUPERADMIN_EMAIL is optional (default superadmin@biborto11.com). Put a value in double quotes if it
# contains "#". It refuses to touch a database that already has the schema, and any failure rolls back.
set -eu

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Missing server/.env. Copy .env.example and fill in deployment settings." >&2
  exit 1
fi

for key in DATABASE_URL SUPERADMIN_PASSWORD; do
  if ! grep -q "^$key=." .env; then
    echo "Set $key in server/.env first (see docs/db/README.md)." >&2
    exit 1
  fi
done

docker compose pull web
# --no-deps: only the app container's image/env is needed, not a running app. The command replaces
# the image's default (node server.js) with the setup script.
docker compose run --rm --no-deps web node scripts/init-db.mjs
