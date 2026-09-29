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

Target is Postgres via [Supabase](https://supabase.com) (free tier is
enough at this scale):

1. Create a Supabase project.
2. Run `schema.sql` then `seed_members.sql` in the SQL editor, in that
   order.
3. Confirm: `select * from public_members;` should return the 12 members
   with only their public fields.

## What this does NOT include yet

- No admin UI wired to this — the Supabase built-in Table Editor can
  serve as the first admin panel with zero extra engineering.
- No login (`site/signin.html` is still a static mockup) — that's Phase 2
  (Supabase Auth, email/password + Google, matching the "Continue with
  Google" button already in the mockup).
- No script yet that regenerates `site/members.html` from this table.
  That's the next concrete step once this schema is confirmed — without
  it, this data and the static HTML will drift apart again.
