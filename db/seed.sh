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
# The superadmin is created with SUPERADMIN_EMAIL (optional) and SUPERADMIN_PASSWORD (required),
# from the environment or web/.env.local.
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

# Reads KEY from web/.env.local (plain KEY=value lines), stripping one pair of surrounding
# single or double quotes the way dotenv does — values containing "#" must be quoted there,
# because an unquoted "#" starts a comment.
env_local() {
  local line
  line="$(grep -m1 "^$1=" "$REPO_ROOT/web/.env.local" 2>/dev/null | cut -d= -f2- || true)"
  if [[ "$line" =~ ^\"(.*)\"$ || "$line" =~ ^\'(.*)\'$ ]]; then line="${BASH_REMATCH[1]}"; fi
  printf '%s' "$line"
}

if [[ -z "${DATABASE_URL:-}" && -f "$REPO_ROOT/web/.env.local" ]]; then
  DATABASE_URL="$(env_local DATABASE_URL)"
  export DATABASE_URL
fi

if [[ -z "${SUPERADMIN_PASSWORD:-}" && -f "$REPO_ROOT/web/.env.local" ]]; then
  SUPERADMIN_PASSWORD="$(env_local SUPERADMIN_PASSWORD)"
  export SUPERADMIN_PASSWORD
fi

# The bootstrap superadmin's email: optional, defaults to superadmin@biborto11.com.
if [[ -z "${SUPERADMIN_EMAIL:-}" && -f "$REPO_ROOT/web/.env.local" ]]; then
  SUPERADMIN_EMAIL="$(env_local SUPERADMIN_EMAIL)"
fi
SUPERADMIN_EMAIL="$(printf '%s' "${SUPERADMIN_EMAIL:-superadmin@biborto11.com}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
if [[ ! "$SUPERADMIN_EMAIL" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; then
  echo "SUPERADMIN_EMAIL is not a valid email address: $SUPERADMIN_EMAIL" >&2
  exit 1
fi
export SUPERADMIN_EMAIL

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
  EXTRA=()
  if [[ "$entity" == "superadmin" ]]; then EXTRA=(-v "superadmin_email=$SUPERADMIN_EMAIL"); fi
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 ${EXTRA[@]+"${EXTRA[@]}"} -f "$SCRIPT_DIR/seed_${entity}.sql"
  if [[ "$entity" == "superadmin" ]]; then
    echo "Creating superadmin password login..."
    node "$REPO_ROOT/web/scripts/seed-superadmin-login.mjs"
  fi
done

echo "Done."
