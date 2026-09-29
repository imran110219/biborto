# Biborto — Batch 11, Khulna University Alumni Platform

This file lives in `docs/`. Other docs are at `docs/web/`, `docs/db/` —
but `web/`, `db/` mentioned below still mean the actual top-level project
folders (the code), not their docs.

Two-part repo:

```
web/    Next.js app — real components, public pages read from a real
        Postgres database, real sign-in gates /admin/**, member/business
        approval are real writes, most other admin content + forms
        still on mock data.
db/     Full Postgres data model (members, businesses, sponsors, events,
        blog, gallery, auth) — wired into web/'s public pages and login
        via Drizzle ORM / Auth.js.
```

`web/` started as a componentized port of a static HTML/CSS mockup
(`site/`) — that folder was removed once the port fully superseded it as
the actively developed project; its design system (colors, type scale,
component shapes) lives on in `docs/web/DESIGN.md`.

## How the pieces relate

- **`web/`** is a componentized Next.js + Tailwind app. Its public pages
  (home, members, business directory, events, blog, gallery) query the
  real database directly, and sign-in (email/password + Google) really
  authenticates and role-gates `/admin/**`. Approving/suspending a member
  and approving/rejecting a business submission are real writes now too
  (see `docs/web/README.md`'s Admin write surface section). Most other
  admin *page content* and forms (business submission, RSVP, edit-post's
  save) still render `web/lib/mock-data.ts` and do nothing. This is the
  actively developed project. See `docs/web/README.md` and
  `docs/web/DESIGN.md`.
- **`db/`** is the full Postgres data model — members, businesses,
  sponsors, events/RSVPs, blog posts, gallery, plus auth (`users`,
  `accounts`, `sessions`, `verification_tokens`) — targeting an
  independent Postgres database (Supabase was considered and ruled out).
  See `docs/db/README.md`.

The overall arc: mockup → componentized frontend → public pages wired to
a real database → auth (sign-in/sign-up real, role-gates `/admin/**`) →
the rest of the write surface, in progress (member/business approval
done via Server Actions; business submission, RSVP, edit-post's save/
publish, sponsors/photos/videos/settings still mock) → file uploads on
Cloudflare R2 instead of local paths (not started — no bucket wired up
yet).

## Target stack

- **Frontend + backend**: Next.js (App Router), one project (`web/`) —
  Route Handlers serve the API, no separate backend service.
- **Database**: independent Postgres (self-hosted/managed — not
  Supabase).
- **Auth**: Auth.js v5 (email/password + Google), JWT sessions — built,
  see `docs/web/README.md`'s Auth section.
- **File storage**: Cloudflare R2 (avatars, gallery media, business
  photos).

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
