# Phase 1: member data foundation

Turns the 12 hardcoded sample members in `site/members.html`,
`site/admin/members.html`, and `site/index.html` into real database rows,
per the report in-conversation (member data report — PM + engineering
analysis, opt-out public-directory consent model).

## Files

- `schema.sql` — the `members` table, enums, indexes, `updated_at`
  trigger, row-level-security policies, and a `public_members` view that
  exposes only public-safe columns (no email/student_id).
- `seed_members.sql` — migrates the existing 12 sample members into rows.
  Two known gaps are called out in its comments (`student_id` and
  `country` were never real data in the mockup, only placeholders) rather
  than silently backfilled with invented values.

## How to run this

Target is an independent Postgres database, not a managed
backend-as-a-service. Any Postgres 14+ instance works (self-hosted,
Docker, RDS, etc.):

1. Provision a Postgres database.
2. Run `schema.sql` then `seed_members.sql` against it, in that order
   (e.g. `psql $DATABASE_URL -f schema.sql`).
3. Confirm: `select * from public_members;` should return the 12 members
   with only their public fields.

## Known gap: schema.sql still assumes Supabase Auth

`schema.sql`'s RLS policies reference `auth.users` / `auth.uid()`, which
are Supabase-specific and don't exist on a plain Postgres instance. Since
the backend decision is an independent Postgres database, this needs to
change before the schema runs as-is: swap in a plain `users` table plus
whatever auth layer is chosen, and rewrite the RLS policies (or the
equivalent application-level checks) against that instead of
`auth.uid()`. Not done yet — flagging so it isn't mistaken for copy-paste
boilerplate.

## What this does NOT include yet

- No admin UI wired to this yet — a generic Postgres client (psql,
  pgAdmin, TablePlus, etc.) works until a real admin panel exists.
- No login (`site/signin.html` is still a static mockup) — that's Phase 2
  (email/password + Google, matching the "Continue with Google" button
  already in the mockup), pending the auth-layer decision above.
- No script yet that regenerates `site/members.html` from this table.
  That's the next concrete step once this schema is confirmed — without
  it, this data and the static HTML will drift apart again.
