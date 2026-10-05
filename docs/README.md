# Biborto — Batch 11, Khulna University Alumni Platform

This file lives in `docs/`. Other docs are at `docs/web/`, `docs/db/` —
but `web/`, `db/` mentioned below still mean the actual top-level project
folders (the code), not their docs. `docs/ROADMAP.md` tracks what's real
vs. mock across both, in build order.

Two-part repo:

```
web/    Next.js app — public pages read from Postgres; Auth.js signs in
        existing members and gates /admin/**. Member/business review
        (superadmin-only; admins view-only),
        event/sponsor/video/blog editing, business submissions and RSVPs
        have real writes. Gallery album and photo management is
        implemented; manual member creation and CSV export are (superadmin
        only); CSV import is not.
db/     Full Postgres data model and seed data, including the current
        active-voter roster (members, businesses, sponsors, events,
        blog, gallery, auth) — wired into web/'s public pages and login
        via Drizzle ORM / Auth.js.
```

`web/` started as a componentized port of a static HTML/CSS mockup
(`site/`) — that folder was removed once the port fully superseded it as
the actively developed project; its design system (colors, type scale,
component shapes) lives on in `docs/web/DESIGN.md`.

## How the pieces relate

- **`web/`** is a componentized Next.js + Tailwind app. Public pages read
  from Postgres; Auth.js handles credentials and Google sign-in for
  existing members and role-gates `/admin/**`. Member and business
  review/edit, business submissions, event RSVPs, and admin editing for
  events, sponsors, videos and blog posts write to Postgres. Superadmins
  can add members manually and export the filtered list as CSV; CSV
  import remains unimplemented. Gallery album management,
  photo captions/deletion, and album/video tabs are implemented.
  See `docs/web/README.md` and `docs/web/DESIGN.md`.
- **`db/`** is the full Postgres data model — members, businesses,
  sponsors, events/RSVPs, blog posts, gallery, plus auth (`users`,
  `accounts`, `sessions`, `verification_tokens`) — targeting an
  independent Postgres database (Supabase was considered and ruled out).
  See `docs/db/README.md`.

Member accounts are committee-managed: the active-voter CSV is the
current source for the member seed, with all roster members assigned the
`member` role. There is no self-service account registration. Superadmins
add members manually at `/admin/members/new` (no login account is
created; the person claims it at `/signup`). Admin CSV import is planned
but not implemented. Admins have view-only access to member profiles;
only superadmins edit, moderate, create and export members.

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
- **Member management**: committee-managed roster; superadmin-only
  manual creation, editing, moderation and CSV export; planned admin CSV
  import. Admins have view-only profile access. No open account
  registration.

## Getting started

`web/` is the project to run, and it now needs a database:

```bash
# 1. provision a Postgres database
# 2. cd web && cp .env.example .env.local, then set DATABASE_URL and
#    AUTH_SECRET (generate with `npx auth secret`) — see docs/web/README.md's
#    Auth section for the optional Google OAuth vars
cd web
npm install       # see web/.npmrc — this network's registry mirror
npm run db:seed   # applies db/schema.sql + db/seed_*.sql — see docs/db/README.md
npm run db:pull   # introspects the DB into drizzle/schema.ts
npm run dev
```

## Note on the root package.json / pnpm-lock.yaml

These exist at the root but there's no `pnpm-workspace.yaml` `packages:`
list wiring `web/` in as a workspace member — `web/` has its own
independent `package.json` and lockfiles and is developed standalone (see
"Getting started" above). Not a functioning monorepo workspace yet, just
placeholder root config.
