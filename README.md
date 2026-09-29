# Biborto — Batch 11, Khulna University Alumni Platform

Three-part repo, in the order the project actually moved through:

```
site/   Static HTML/CSS mockup — the original design, no backend, no build step.
web/    Next.js port of that mockup — same design/content, real components.
db/     Full Postgres data model (members, businesses, sponsors, events,
        blog, gallery) — not wired to web/ yet.
```

## How the pieces relate

- **`site/`** is the original design export, split into plain multi-page
  HTML/CSS. Pure mockup: sample data, inert forms, almost no JS. See
  `site/README.md` and `site/DESIGN.md`.
- **`web/`** is the "build it properly" step: every page and component from
  `site/` ported into a componentized Next.js + Tailwind app, still
  rendering from static mock data (`web/lib/mock-data.ts`) rather than a
  database. This is the actively developed project. See `web/README.md`.
- **`db/`** is the full Postgres data model — members, businesses,
  sponsors, events/RSVPs, blog posts, gallery — targeting an independent
  Postgres database (Supabase was considered and ruled out). Not
  connected to `web/` yet; `web/` still reads from mock data. See
  `db/README.md`.

The overall arc: mockup → componentized frontend (current) → real backend
(decided, not started — `web/` becomes both frontend and backend via its
own Next.js Route Handlers, querying the independent Postgres database in
`db/`, with file uploads — avatars, gallery media, business photos — on
Cloudflare R2 instead of local paths).

## Target stack

- **Frontend + backend**: Next.js (App Router), one project (`web/`) —
  Route Handlers serve the API, no separate backend service.
- **Database**: independent Postgres (self-hosted/managed — not
  Supabase).
- **File storage**: Cloudflare R2 (avatars, gallery media, business
  photos).

## Getting started

`web/` is the project to run:

```bash
cd web
npm install   # see web/.npmrc — this network's registry mirror
npm run dev
```

`site/`'s HTML files can be opened directly in a browser, no server needed.

`db/`'s SQL files aren't runnable against anything yet — see `db/README.md`
for how to stand up a Postgres instance and load them.

## Note on the root package.json / pnpm-lock.yaml

These exist at the root but there's no `pnpm-workspace.yaml` `packages:`
list wiring `web/` in as a workspace member — `web/` has its own
independent `package.json` and lockfiles and is developed standalone (see
"Getting started" above). Not a functioning monorepo workspace yet, just
placeholder root config.
