# Migrations

**There are none yet.** Until the first production deployment, `db/schema.sql` *is* the
database: change it directly, then `npm run db:reset` and `npm run db:pull`. (The fifteen
incremental files that used to live here were already folded into `schema.sql`; a database built
from `schema.sql` alone was checked to be identical to the one they produced.)

From the first production deploy on, a live database can't be rebuilt, so every schema change needs
both:

1. an edit to `db/schema.sql`, so a fresh install gets the final shape; and
2. a numbered, forward-only file here (`001_short_name.sql`) that upgrades an existing database,
   written to be safe to run once and (where practical) idempotent (`if not exists`).

Apply new files by hand, in order, before deploying app code that needs them
(`psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_….sql`), then `npm run db:pull`.
See docs/db/README.md.
