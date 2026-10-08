#!/usr/bin/env bash
# Applies db/schema.sql and then the db/seed_*.sql files, in dependency order
# (disciplines/countries before members; members before businesses/sponsors/
# blog_posts; businesses before sponsors) — not alphabetical.
#
# Two groups:
#   core    disciplines, countries, members (the real 241-person roster), superadmin,
#           site_settings. What a real deployment needs.
#   sample  businesses, sponsors, events, blog_posts, gallery. Invented demo content
#           (example.com sponsors, a fictional reunion, ...). For development/tests.
#
# Usage (typically `npm run db:seed` / `db:reset` / `db:seed:core` / `db:reset:core`
# from web/ — see web/package.json):
#   db/seed.sh                  # schema + core + sample (fails on a non-empty DB —
#                               # the seed files are plain INSERTs, not upserts)
#   db/seed.sh --core           # schema + core only — use this for production
#   db/seed.sh --reset [--core] # drop and recreate the public schema first, so it is
#                               # safe to run against an already-seeded database
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

RESET=0
CORE_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=1 ;;
    --core) CORE_ONLY=1 ;;
    *) echo "Unknown option: $arg (use --reset and/or --core)" >&2; exit 1 ;;
  esac
done

if [[ "$RESET" == 1 ]]; then
  # Drops schema contents, not the database itself — works the same on a
  # local Postgres and on a managed instance where the connection's user
  # may not have privileges to DROP DATABASE.
  echo "Resetting schema (drop schema public cascade)..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "drop schema if exists public cascade; create schema public;"
fi

echo "Applying schema.sql..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/schema.sql"

CORE=(disciplines countries members superadmin site_settings)
SAMPLE=(businesses sponsors events blog_posts gallery)
ENTITIES=("${CORE[@]}")
if [[ "$CORE_ONLY" == 0 ]]; then
  ENTITIES+=("${SAMPLE[@]}")
else
  echo "Core only: skipping sample content (${SAMPLE[*]})."
fi

for entity in "${ENTITIES[@]}"; do
  echo "Seeding $entity..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/seed_${entity}.sql"
  if [[ "$entity" == "superadmin" ]]; then
    echo "Creating superadmin password login..."
    node "$REPO_ROOT/web/scripts/seed-superadmin-login.mjs"
  fi
done

echo "Done."
