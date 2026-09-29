# Biborto — Batch 11, Khulna University Alumni Platform

Three-part repo, in the order the project actually moved through:

```
site/   Static HTML/CSS mockup — the original design, no backend, no build step.
web/    Next.js port of that mockup — real components, public pages read
        from a real Postgres database, admin/forms still on mock data.
db/     Full Postgres data model (members, businesses, sponsors, events,
        blog, gallery) — wired into web/'s public pages via Drizzle ORM.
```

## How the pieces relate

- **`site/`** is the original design export, split into plain multi-page
  HTML/CSS. Pure mockup: sample data, inert forms, almost no JS. See
  `site/README.md` and `site/DESIGN.md`.
- **`web/`** is the "build it properly" step: every page and component from
  `site/` ported into a componentized Next.js + Tailwind app. Its public
  pages (home, members, business directory, events, blog, gallery) now
  query the real database directly; admin pages and every form still
  render `web/lib/mock-data.ts`, pending Phase 2 auth. This is the
  actively developed project. See `web/README.md`.
- **`db/`** is the full Postgres data model — members, businesses,
  sponsors, events/RSVPs, blog posts, gallery — targeting an independent
  Postgres database (Supabase was considered and ruled out). See
  `db/README.md`.

The overall arc: mockup → componentized frontend → public pages wired to
a real database (current) → auth + write paths (Phase 2, not started —
sign-in, RSVP, submitting a business, admin approvals; `web/` becomes
both frontend and backend via its own Next.js Route Handlers once that
lands) → file uploads on Cloudflare R2 instead of local paths (also not
started — no bucket wired up yet).

## Target stack

- **Frontend + backend**: Next.js (App Router), one project (`web/`) —
  Route Handlers serve the API, no separate backend service.
- **Database**: independent Postgres (self-hosted/managed — not
  Supabase).
- **File storage**: Cloudflare R2 (avatars, gallery media, business
  photos).

## Getting started

`web/` is the project to run, and it now needs a database:

```bash
# 1. stand up Postgres + load the schema and seed data — see db/README.md
# 2. cd web && cp .env.example .env.local, then set DATABASE_URL
cd web
npm install   # see web/.npmrc — this network's registry mirror
npm run db:pull   # introspects the DB into drizzle/schema.ts
npm run dev
```

`site/`'s HTML files can be opened directly in a browser, no server needed.

## Note on the root package.json / pnpm-lock.yaml

These exist at the root but there's no `pnpm-workspace.yaml` `packages:`
list wiring `web/` in as a workspace member — `web/` has its own
independent `package.json` and lockfiles and is developed standalone (see
"Getting started" above). Not a functioning monorepo workspace yet, just
placeholder root config.
