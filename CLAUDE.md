# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo structure

Two parts — see `docs/README.md` for the full narrative:

- **`web/`** — the Next.js (App Router) app. This is the actively developed project. It began as a port of a static HTML/CSS mockup (`site/`), removed once the port fully superseded it — see `docs/web/DESIGN.md` for the design system that survived the removal.
- **`db/`** — the Postgres schema and seed data.

**Docs live in `docs/`, not next to the code.** `docs/README.md`, `docs/web/README.md` + `DESIGN.md`, `docs/db/README.md`. Paths inside `docs/web/README.md` and `docs/db/README.md` are relative to `web/`/`db/` unless a `docs/` or other top-level folder is named explicitly — read the disclaimer at the top of each before trusting a bare relative path.

## Commands

All from `web/` (there is no root build/test setup — the root `package.json` is just a placeholder):

```bash
cd web
npm install          # registry.npmjs.org is blocked on this network — .npmrc points at registry.npmmirror.com instead
                     # (node_modules is actually pnpm-managed — use `pnpm add <pkg>` to add dependencies so pnpm-lock.yaml stays in sync)
npm run dev           # dev server
npm run build         # production build — no database needed (every page renders per request)
npm run lint          # eslint
npm run db:pull       # regenerate web/drizzle/schema.ts + relations.ts by introspecting the live DB
npm run db:seed       # apply db/schema.sql + all db/seed_*.sql (core + sample) to $DATABASE_URL (fails fast on a non-empty DB)
npm run db:reset      # drop schema public cascade, then db:seed — safe to rerun anytime
npm run db:seed:core  # same, but core data only (roster, reference data, settings, superadmin) — use for production
npm run db:reset:core # drop schema public cascade, then db:seed:core
```

Tests (Vitest, all from `web/`; see "Testing" in `docs/web/README.md`):

```bash
npm test                  # unit tests — pure logic, no server or database (tests/unit)
npm run test:integration  # needs the dev Postgres from .env.local: rate limiting + schema invariants (tests/integration)
npm run test:smoke        # needs a running, seeded server (npm run dev): HTTP checks of pages, headers, access control (tests/smoke)
```

New logic that doesn't touch the database should be written so it can be unit-tested (see how `lib/members/import.ts` splits `interpretTable`/`decideRows` from its queries). CI runs all three.

Database setup (see `docs/db/README.md` for detail): provision Postgres, point `web/.env.local`'s `DATABASE_URL` at it, then `npm run db:seed` (or `npm run db:reset` if it's not empty) — this runs `db/seed.sh`, which applies `db/schema.sql` followed by the `db/seed_*.sql` files **in dependency order** — core: `disciplines`, `countries`, `members`, `superadmin`, `site_settings`; then sample content: `businesses`, `sponsors`, `events`, `gallery` — since later ones FK into earlier ones. `--core` (`npm run db:seed:core`) skips the sample content, which is invented demo data. (There is no blog seed: posts are written by members and admins.) Then `npm run db:pull`. Also set `AUTH_SECRET` (generate with `npx auth secret`) — required for auth to work at all, see "Auth" below.

**Production database setup** (empty database, once): `server/init-db.sh` runs `web/scripts/init-db.mjs` inside the app image — schema + core seed + superadmin in one transaction (needs `SUPERADMIN_PASSWORD`, optional `SUPERADMIN_EMAIL`); `npm run db:seed:core` does the same from a checkout. `db/migrations/` is empty until the first production deploy (see its README).

**Killing a dev/prod Next.js server**: `pkill -f "next start"` / matching on the npm script name does **not** work — the actual process is named `next-server`. Use `pkill -f "next-server"`. A leftover `next-server` process holds a live Postgres connection open and will silently block `dropdb`/schema-reload attempts on a subsequent session — `npm run db:reset` sidesteps this entirely since it only drops the `public` schema, not the database.

## Architecture

### Current phase: database-backed public pages and most write paths

Public pages query Postgres. Auth supports credentials and Google providers and gates `/admin/**`. Member creation/edit/moderation and sponsor management with logo upload (superadmin-only; admins are view-only; at most one active diamond sponsor), member list filters/pagination and CSV export, business creation/edit/review (superadmin-only; admins are view-only) with filtered lists/pagination and CSV export, business submission, event RSVP and admin CRUD for events, sponsors, videos and blog posts write to Postgres. Superadmins manage home-page popups (custom HTML in a sandboxed iframe, or an image/GIF) at `/admin/popups`; with none active no popup is shown (the popup feature is independent of sponsors). Gallery upload and public image display use R2 when configured. Settings (`site_settings`), the dashboard activity feed (`activity_log` via `lib/activity.ts`) and the public `/members` and `/events` filters are real. Member CSV import (`/admin/members/import`, superadmin-only, preview then apply) is built; ideas not yet built are listed in `docs/ROADMAP.md` §8.

The member seed comes from `active-voter-list.csv` (241 roster rows), with all CSV members assigned the `member` role. The committee-managed workflow has no public account registration. Members enter only through an admin: a superadmin adds an **email and a roll** at `/admin/members/new` (the discipline is read from the roll), or imports a CSV (`lib/members/import.ts`; role/status columns are ignored), and can export CSV. The person then signs in with that email (Google, or the verified-email link at `/signup`) and confirms their name at `/welcome` before they appear in the directory. See "Member onboarding" in `docs/web/README.md`.

### `db/schema.sql` is the single source of truth for the schema

Not Drizzle. `web/drizzle/schema.ts` + `relations.ts` are generated by `npm run db:pull` (introspection), never hand-edited, and `web/drizzle.config.ts` never runs `generate`/`push`. Whenever `db/schema.sql` changes: reapply it to the dev DB, rerun the seeds, then `npm run db:pull`.

`db/schema.sql` deliberately omits `default ''` / `default '{}'` on a few `text`/`text[]` columns (`blog_posts.body`, `blog_posts.tags`, `businesses.offerings`) — `drizzle-kit pull`'s introspection codegen mis-renders empty-string/empty-array defaults (invalid syntax for `''`, silently wrong `[""]` instead of `[]` for `'{}'`). Every insert already supplies these explicitly, so no default is needed. If a schema change reintroduces one of these and `db:pull` produces a broken `schema.ts`, this is why.

Reference data (`disciplines`, `countries`) is normalized into real tables with `updated_at` triggers, not enums — they're someone else's authoritative external lists (Khulna University's own discipline codes; ISO 3166-1 countries, sourced from Node's `Intl.DisplayNames`/CLDR data, not hand-typed), not small app-specific vocabularies. Smaller genuinely-fixed sets (`business_category`, `blog_category`, `event_category`, `sponsor_tier`, `blood_group`, `school_name`) stay as Postgres enums.

No Supabase, no row-level security. RLS leaned on Supabase's `auth.uid()` JWT wiring, which a plain Postgres connection doesn't get for free. Authorization instead lives in application code: Server Components enforce the same `status`/`is_public`/`visibility` filters the `public_*` views encode for reads, and `web/proxy.ts` (see "Auth" below) does the same for `/admin/**` access.

Each member has two profile URLs: `/members/<name-slug>` (`members.slug`, canonical) and `/members/<discipline-short-code>-<roll>` (e.g. `arch-110101`; `student_id` is unique); see "Member profile URLs" in `docs/web/README.md`.

Sensitive member fields (`email`, `phone_number`, `student_id`, `blood_group`, `date_of_birth`) are admin-only by convention — always excluded from the `public_members` view and from the `PublicMember`/`PublicMemberDetail` types in `web/lib/types.ts`. This isn't just a UI filter: a Server Component's props get serialized to the client, so leaving one of these in the returned object would leak it over the wire even if no component renders it.

### `web/lib/db/` — the data layer

- `client.ts` — one pooled `postgres-js` connection, cached on `globalThis` (Next dev's hot-reload re-evaluates modules on every edit; without the cache each edit would leak a new pool).
- `format.ts` — DB row → display-string helpers (initials from a name, event/blog date formatting, read-time estimation from body length — read time is never stored, always derived).
- `queries/*.ts` — one file per entity. Each maps Drizzle's generated row shape onto the existing types in `web/lib/types.ts` rather than exposing generated types to components directly, so card components (`MemberCard`, `BusinessCard`, etc.) needed zero changes when the data source moved from mock to real. Several queries join tables the `public_*` views don't cover (e.g. `businesses.owner_member_id` → `members.name`) — see each file's comment for why it queries base tables instead of the view.

Public pages are plain `async` Server Components calling these query functions directly — no Route Handlers for reads. Pages render per request (the root layout reads the site settings and the proxy sets a CSP nonce), so there is no `generateStaticParams()` and `npm run build` needs no database.

### Auth (Auth.js v5 — `next-auth@beta` + `@auth/drizzle-adapter`)

Config is `web/auth.ts`; full writeup in `docs/web/README.md`'s Auth section. The gotchas worth knowing before touching this:

- **`web/lib/db/auth-schema.ts` is hand-written, not generated** — the one deliberate exception to the `db/schema.sql` → `db:pull` → `drizzle/schema.ts` pipeline everything else follows. `@auth/drizzle-adapter` requires exact property names (`refresh_token`, not the `refreshToken` drizzle-kit's casing would produce) and `mode: "date"` timestamps that introspection can't reproduce. If `db/schema.sql`'s `users`/`accounts`/`sessions`/`verification_tokens` DDL changes, this file needs a matching hand-edit — `db:pull` won't touch it.
- **`web/proxy.ts`**, not `middleware.ts` — Next.js 16 renamed the file convention; the deprecation warning on build is real, don't recreate `middleware.ts`. It runs on the Node.js runtime (the Next 16 default), so it can use `postgres`. It gates `/admin/**` on `platform_role` from the session, and `auth.ts`'s `jwt` callback re-reads the member's role and status from the database on every request — so promotion, demotion and suspension take effect immediately (a suspended member's session ends). The same proxy sets the per-request CSP nonce and security headers (`lib/security/csp.ts`); see "Security hardening" in `docs/web/README.md`.
- **JWT sessions, not database sessions** — Auth.js doesn't support database sessions with the Credentials provider, so both providers use JWT for consistency.
- **Members contribute by submitting only:** blog posts (`/blog/submit` → `pending`, admin approves/rejects) and business listings (`/business/submit`, max 2 per member, enforced under an advisory lock); they track status on `/account/submissions` but can't edit after submitting.
- **Member self-service lives at `/account`** (tabs: profile, submissions & events, security); `/forgot-password` + `/reset-password` handle resets for claimed accounts. Name, discipline, email, student ID, role and status are not editable there (the name is set once at `/welcome`).
- **No registration of any kind.** Only an admin can create a member (email + roll, or CSV). `/signup` ("Activate your account") only links an existing roster row to a login via an emailed one-time link; a Google sign-in whose email isn't on the roster is refused and records **nothing** (no pending row, no user, no session). A new person's `members.profile_completed_at` is NULL until they confirm their details at `/welcome`; `proxy.ts` sends them there on every page until then, and until then they are hidden (`is_public = false`).
- **Google sign-in is code-complete but unverified end-to-end.** Put local OAuth settings in ignored `web/.env.local`; keep `.env.example` blank. Credentials (email/password) sign-in/claim/sign-out were verified against a live server and database.

### File storage

Columns named `*_key` (`avatar_key`, `cover_photo_key`, `logo_key`, `r2_key`) store Cloudflare R2 object keys, not URLs. Gallery uploads go through `web/app/api/admin/gallery/photos/route.ts`, which checks admin/superadmin access, and public gallery pages resolve keys through `R2_PUBLIC_URL`. Set the `R2_*` variables in ignored `web/.env.local`; the route needs Object Read & Write credentials and a public bucket domain. Member profile and cover photos also use R2, as do blog images (`blog/<member id>/…`, uploaded through `/api/blog/images` by the rich-text editor; post bodies are Markdown rendered safely by `components/BlogBody.tsx`); business image uploads are not implemented.
