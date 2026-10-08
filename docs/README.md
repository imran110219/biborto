# Biborto — Batch 11, Khulna University Alumni Platform

This file lives in `docs/`. Other docs are at `docs/web/`, `docs/db/` —
but `web/`, `db/` mentioned below still mean the actual top-level project
folders (the code), not their docs. `docs/ROADMAP.md` tracks what's real
vs. mock across both, in build order.

Two-part repo (plus deployment files):

```
web/      Next.js app — public pages read from Postgres; Auth.js signs in
          existing members and gates /admin/**. Everything the committee does
          (members, businesses, events, sponsors, videos, blog, gallery, popups,
          settings) has real writes; members sign in, confirm their profile and
          contribute (blog posts, business listings, RSVPs) for review.
db/       The Postgres data model (schema.sql — the single source of truth) and
          seed data: the real 241-member roster plus optional sample content.
server/   Manual deployment: docker compose, deploy.sh, and init-db.sh for the
          one-time database setup. Docker image built by CI (Dockerfile at the root).
```

`web/` started as a componentized port of a static HTML/CSS mockup
(`site/`) — that folder was removed once the port fully superseded it as
the actively developed project; its design system (colors, type scale,
component shapes) lives on in `docs/web/DESIGN.md`.

## How the pieces relate

- **`web/`** is a componentized Next.js + Tailwind app. Public pages read
  from Postgres; Auth.js handles credentials and Google sign-in for
  existing members and role-gates `/admin/**`. A per-request CSP nonce and
  security headers are set in `proxy.ts`. Site identity (name, motto, colours,
  footer links, reunion fee/deadline) is edited in `/admin/settings`, not in code.
  See `docs/web/README.md` and `docs/web/DESIGN.md`.
- **`db/`** is the full Postgres data model — members, businesses,
  sponsors, events/RSVPs, blog posts, gallery, popups, settings, rate limits,
  activity log, plus auth (`users`, `accounts`, `sessions`, `verification_tokens`)
  — targeting an independent Postgres database (Supabase was considered and
  ruled out). `db/migrations/` is empty until the first production deploy.
  See `docs/db/README.md`.
- **`server/`** is how it gets deployed: CI publishes the image, `init-db.sh`
  sets up an empty database once, `deploy.sh` pulls and restarts. See `server/README.md`.

**Members.** There is **no registration**. A superadmin adds each person by
**email and roll** (at `/admin/members/new`, or by CSV at `/admin/members/import`);
the discipline is read from the roll. The person activates the account with
Google or a verified-email link, then confirms their name at `/welcome` before
they appear in the directory. The active-voter CSV (241 people, who already have
names) is the seed. Signed-in members manage their own profile, photos and
password at `/account`; name, discipline, email, roll, role and status stay with
the committee. Admins have view-only access to members; only superadmins edit,
moderate, add, import and export them. See "Member onboarding" in `docs/web/README.md`.

Gallery image upload and public display are wired through Cloudflare R2.
The application still needs R2 account credentials and a public bucket
domain in `web/.env.local`. Admins and superadmins manage photos; only
superadmins manage albums. Albums must be empty before deletion.

## Target stack

- **Frontend + backend**: Next.js (App Router), one project (`web/`) —
  Route Handlers serve the API, no separate backend service.
- **Database**: independent Postgres (self-hosted/managed — not
  Supabase).
- **Auth**: Auth.js v5 (email/password + Google), JWT sessions — built,
  see `docs/web/README.md`'s Auth section.
- **File storage**: Cloudflare R2 (avatars, gallery media, business
  photos).
- **Member management**: committee-managed — superadmins add people by email + roll (form or CSV), members
  activate and confirm themselves; no open registration. Admins have view-only profile access.

## Getting started

`web/` is the project to run, and it needs a database:

```bash
# 1. provision a Postgres database
# 2. cd web && cp .env.example .env.local, then set DATABASE_URL, AUTH_SECRET
#    (generate with `npx auth secret`) and SUPERADMIN_PASSWORD (quote it if it
#    contains #) — see docs/web/README.md's Auth section for the optional vars
cd web
npm install       # see web/.npmrc — this network's registry mirror
npm run db:seed   # schema + roster + sample content — see docs/db/README.md
npm run db:pull   # introspects the DB into drizzle/schema.ts
npm run dev
npm test          # unit tests (also: test:integration, test:smoke)
```

For a real deployment use `db:seed:core` (no sample content) or, on the server,
`server/init-db.sh` — see `server/README.md`.

## Note on the root package.json / pnpm-lock.yaml

These exist at the root but there's no `pnpm-workspace.yaml` `packages:`
list wiring `web/` in as a workspace member — `web/` has its own
independent `package.json` and lockfiles and is developed standalone (see
"Getting started" above). Not a functioning monorepo workspace yet, just
placeholder root config.
