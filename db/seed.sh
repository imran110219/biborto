#!/usr/bin/env bash
# Applies db/schema.sql and every db/seed_*.sql file, in the dependency
# order docs/db/README.md's "Files" section documents (disciplines/
# countries before members; members before businesses/sponsors/blog_posts;
# businesses before sponsors) — not alphabetical, since seed_businesses.sql
# etc. reference rows the earlier files create.
#
# Usage (from anywhere, typically `npm run db:seed` / `npm run db:reset`
# from web/ — see web/package.json):
#   db/seed.sh          # apply schema + seeds (fails on a non-empty DB —
#                        # seed_*.sql are plain INSERTs, not upserts)
#   db/seed.sh --reset  # drop and recreate the public schema first, so
#                        # this is safe to run against an already-seeded DB
set -euo pipefail
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

if [[ -z "${DATABASE_URL:-}" && -f "$REPO_ROOT/web/.env.local" ]]; then
  # web/.env.local is plain KEY=value, no quoting/export — a single grep+cut
  # is enough, matching how it's already written (see web/.env.example).
  DATABASE_URL="$(grep -m1 '^DATABASE_URL=' "$REPO_ROOT/web/.env.local" | cut -d= -f2-)"
  export DATABASE_URL
fi

if [[ -z "${SUPERADMIN_PASSWORD:-}" && -f "$REPO_ROOT/web/.env.local" ]]; then
  SUPERADMIN_PASSWORD="$(grep -m1 '^SUPERADMIN_PASSWORD=' "$REPO_ROOT/web/.env.local" | cut -d= -f2-)"
  export SUPERADMIN_PASSWORD
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set (checked the environment and web/.env.local)." >&2
  exit 1
fi

if [[ ${#SUPERADMIN_PASSWORD} -lt 8 ]]; then
  echo "SUPERADMIN_PASSWORD is required and must be at least 8 characters (set it in the environment or web/.env.local)." >&2
  exit 1
fi

if [[ "${1:-}" == "--reset" ]]; then
  # Drops schema contents, not the database itself — works the same on a
  # local Postgres and on a managed instance where the connection's user
  # may not have privileges to DROP DATABASE.
  echo "Resetting schema (drop schema public cascade)..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "drop schema if exists public cascade; create schema public;"
fi

echo "Applying schema.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/schema.sql"

for entity in disciplines countries members superadmin businesses sponsors events blog_posts gallery; do
  echo "Seeding $entity..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/seed_${entity}.sql"
  if [[ "$entity" == "superadmin" ]]; then
    echo "Creating superadmin password login..."
    node "$REPO_ROOT/web/scripts/seed-superadmin-login.mjs"
  fi
done

echo "Done."
