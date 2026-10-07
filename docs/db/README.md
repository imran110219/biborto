# Data model

Docs for `db/` — paths below are given from the repo root, since this
file lives in `docs/db/` rather than next to the SQL it describes.

The Postgres schema for the Batch 11 platform supports the database-backed
public pages and admin workflows in `web/`: members, businesses, sponsors,
events + RSVPs, blog posts, gallery albums/photos/videos, and auth. The
member seed uses the active-voter roster; other seeded content is sample
data. Field choices also reflect `web/lib/types.ts` and the admin pages —
this isn't a speculative model, it's what the UI assumes.

## Files

- `db/schema.sql` — the full schema: enums, all tables, indexes,
  `updated_at` triggers, and `public_*` views that expose only
  public-safe columns. See the file's header comment for the auth,
  authorization, and file-storage decisions baked into it.
- `db/migrations/001_google_membership_requests.sql` — one-time migration
  for an existing database, allowing pending Google membership requests
  to omit discipline until an admin collects it.
- `db/migrations/002_member_campus_name.sql` through
  `db/migrations/004_member_cover_photo.sql` — optional member campus/profile
  fields and cover-photo storage.
- `db/migrations/005_gallery_album_links.sql` and
  `db/migrations/006_gallery_video_links.sql` — optional event and discipline
  links for gallery albums and videos.
- `db/migrations/007_gallery_videos.sql` — creates the video table for an
  existing database that predates gallery videos.
- `db/migrations/008_business_social_links.sql` — adds optional
  `businesses.linkedin_url` / `facebook_url` and appends them to the
  `public_businesses` view. Apply to an existing database, then
  `npm run db:pull`.
- `db/migrations/009_popups.sql` — adds the `popups` table and `popup_kind`
  enum (superadmin-managed home-page popups). Apply to an existing database,
  then `npm run db:pull`.
- `db/migrations/010_one_active_diamond_sponsor.sql` — partial unique index so
  at most one *active* diamond sponsor exists. Deactivate extra active
  diamonds before applying to an existing database, then `npm run db:pull`.
- `db/migrations/015_member_slugs.sql` — makes `members.student_id` unique (partial
  unique index) and **rewrites every `members.slug`** to the slugified name, so old
  `/members/<slug>` links break. `seed_members.sql` now uses name slugs too; the second URL, `/members/<discipline short code>-<roll>`, is computed at request time, not stored. Apply to an
  existing database, then `npm run db:pull`.
- `db/migrations/014_site_settings.sql` — adds the `site_settings` key/value table
  behind `/admin/settings` (organization name, contact email, social links, reunion
  fee and deadline). Apply to an existing database, then `npm run db:pull`.
- `db/migrations/013_rate_limits.sql` — adds the `rate_limits` table (fixed-window
  counters used by `web/lib/security/rate-limit.ts`). Apply to an existing database,
  then `npm run db:pull`.
- `db/migrations/012_blog_submissions.sql` — adds `pending` and `rejected` to the
  `blog_status` enum (member blog submissions awaiting / failing review). Apply to
  an existing database, then `npm run db:pull`.
- `db/migrations/011_is_public.sql` — adds a shared `is_public` flag to
  `blog_posts`, `events`, `gallery_albums` and `gallery_videos`, and replaces
  `blog_posts.visibility` (dropping the `blog_visibility` enum) with it. Apply
  to an existing database, then `npm run db:pull`.
- `db/seed.sh` — runs `schema.sql` then every `seed_*.sql` below against
  `$DATABASE_URL` (or `web/.env.local`'s, if unset), in the required
  order. Wired up as `npm run db:seed` / `npm run db:reset` from `web/`
  — see "How to run this" below.
- `db/seed_disciplines.sql` — Khulna University's discipline reference
  list, codes 01-24 (code, school, name, short code, slug, website
  path), supplied directly as authoritative data, not derived from the
  mockup. Must run before `db/seed_members.sql`.
- `db/seed_countries.sql` — 243 countries/territories for the "current
  country" dropdown: ISO 3166-1 codes and English names sourced from the
  ICU/CLDR data bundled with Node's `Intl.DisplayNames` (generated, not
  hand-typed — see the file's own header for exactly which codes were
  kept vs. dropped and why). Must run before `db/seed_members.sql`.
- `db/seed_members.sql` contains the 241 records from the top-level
  `active-voter-list.csv`. It stores Roll as `student_id`, plus source
  name, email and phone; CSV discipline codes `BAD` and `BANGLA` map to
  KU reference codes `BA` and `BAN`. Since the CSV has no platform roles
  or app approval statuses, every roster row is seeded as an active
  `member`. Profession, city and country are left unset.
- `db/seed_superadmin.sql` and `web/scripts/seed-superadmin-login.mjs`
  create the non-public bootstrap superadmin and its password login. Set
  `SUPERADMIN_PASSWORD` before seeding; only a bcrypt hash is stored.
- `db/seed_businesses.sql`, `db/seed_sponsors.sql`,
  `db/seed_events.sql`, `db/seed_blog_posts.sql`, and
  `db/seed_gallery.sql` seed the remaining sample content in dependency
  order (businesses link to members; sponsors can link to businesses;
  blog posts can link to members). Their headers document mockup gaps
  rather than invent missing source values. `activity_log` has no seed.
  `users`/`accounts`/`sessions` are populated at runtime by claiming an
  account or signing in, not by a SQL seed.

## Entities

| Table | What it is |
|---|---|
| `users`, `accounts`, `sessions`, `verification_tokens` | Login identity (Phase 2, built) — shaped to match `@auth/drizzle-adapter`'s expected schema so Auth.js (next-auth v5) can be pointed at them directly, plus `password_hash` on `users` for credentials sign-in, which the adapter doesn't provide. See `docs/web/README.md`'s Auth section. |
| `disciplines` | Khulna University's discipline reference list (codes 01-24), grouped by `school`. A real table, not an enum — see "Disciplines are a reference table" below. |
| `countries` | ISO 3166-1 countries/territories for the "current country" dropdown. Same reasoning as `disciplines` — see "Countries are a reference table" below. |
| `members` | The alumni directory / profile data. `slug` powers `web/app/members/[slug]`. `discipline_id` references `disciplines`; `country_id` (nullable) references `countries`. `user_id` links to `users` once a member logs in; a roster row can exist without a login. |
| `businesses` | Alumni-run Business Directory listings, self-submitted, approve/reject workflow (`status`, `reviewed_by`, `reviewed_at`). Optional contact links: `website`, `linkedin_url`, `facebook_url`. |
| `popups` | Superadmin-managed home-page popups: `kind` is `html` (sandboxed iframe) or `image` (R2 `image_key`, animated GIF/WebP animate), optional `link_url`, `active`. A partial unique index allows at most one active row; none active → no popup is shown. |
| `sponsors` | Committee-curated sponsor tiers (at most one *active* diamond — partial unique index; logos in R2 via `logo_key`). `business_id` is an *optional* cross-link — sponsors are managed independently of the Business Directory, even though several sponsors are also listed businesses. |
| `events`, `event_rsvps` | Reunion/chapter events (with `is_public`) and member RSVPs (`going` / `interested` / `declined`). |
| `blog_posts` | `status` (`draft` admin working copy, `pending` member submission awaiting review, `published`, `rejected`), `is_public` (replaced the old public/members-only `visibility`), tags. `body` holds the full article; read time is computed at render time, not stored. `author_name` is a free-text byline fallback for posts with no real member author (e.g. "Reunion committee"). |
| `gallery_albums`, `gallery_photos`, `gallery_videos` | R2-hosted photo albums (with `is_public`; photos inherit their album's visibility) with optional event/discipline links, plus YouTube videos (with `is_public`) with optional event/discipline links. Superadmins create, edit, and delete empty albums; admins and superadmins upload, caption, and delete photos. |
| `activity_log` | Backs the admin dashboard's "Recent activity" panel — precomputed human-readable entries, generic across entity types. |

## Key design decisions

- **No Supabase, no RLS.** The earlier schema had RLS policies built on
  Supabase's `auth.uid()`, which only works because Supabase wires a JWT
  into every connection. A plain Postgres connection doesn't get that for
  free — reproducing it would mean `SET LOCAL` session variables per
  request. Simpler default: authorization lives in application code —
  Server Components querying Postgres directly for reads, and now (Phase
  2, built) a `proxy.ts` (Next.js 16's renamed `middleware.ts`) reading
  `platform_role` off the session JWT to gate `/admin/**` for writes —
  same as any other Postgres-backed app. See `docs/web/README.md`'s Auth
  section for how sign-in and role-gating actually work.
- **Files are stored in R2, not Postgres.** Columns named `*_key`
  (`avatar_key`, `cover_photo_key`, `logo_key`, `r2_key`) store an object
  key. Gallery photo upload writes to R2 and stores the key in
  `gallery_photos`; public gallery pages resolve it through
  `R2_PUBLIC_URL`. Photo uploads accept JPEG, PNG, WebP, and GIF up to
  15 MB. Member profile and cover images use the same bucket through a
  separate admin upload flow.
- **Sponsors are not businesses.** 5 of the current 5 mock sponsors
  happen to match businesses by name — a sponsor is often also a
  batchmate's business — but the design (see `docs/web/DESIGN.md`)
  treats them as separately curated. `sponsors.business_id` is an
  optional cross-link, not a hard dependency.
- **`blood_group` is members-only, not public.** It's in the `members`
  table but deliberately left out of `public_members` — more sensitive
  than the rest of the public directory card, meant for a members-only
  emergency-donor search, not anonymous visitors.
- **`date_of_birth` is admin-only, same call as `blood_group`.** Real
  PII — identity-theft and age-discrimination risk — so it's excluded
  from `public_members` too. A birthday-reminder feature would only need
  month+day, not the full date; not built, so the full date stays
  admin-only for now rather than splitting it preemptively.
- **`avatar_key` (the member photo) is wired through the app layer, not
  just the DB.** `PublicMember`/`PublicMemberDetail` in `web/lib/types.ts`
  now carry it and the query layer selects it, but nothing renders it
  yet — `Avatar` (`web/components/ui/Avatar.tsx`) still displays initials.
  Member photo upload/rendering is separate from the implemented gallery
  upload path.
- **`platform_role` has three values:** `member`, `admin`, `superadmin`.
  All 241 roster rows are ordinary members. The separate bootstrap
  superadmin has no discipline; admin roles are assigned by the committee,
  not inferred from the active-voter CSV.
- **Disciplines are a reference table, not an enum.** They started as a
  12-value `member_discipline` enum scoped to the mock data — reasonable
  when that was all the data available. Given Khulna University's real,
  authoritative discipline list (codes 01-24: code, school, name, short
  code, slug, website path — see `db/seed_disciplines.sql`), a flat enum
  was the wrong shape: `disciplines` is now a proper table, grouped by
  `school` (`school_name` enum, 8 values — KU's own School/Discipline
  structure).
  `members.discipline_id` references it. The active-voter CSV uses short
  codes; `BAD` maps to `BA` (Business Administration), and `BANGLA` maps
  to `BAN` (Bangla) in `db/seed_members.sql`.
- **Countries are a reference table, for the same reason as
  disciplines.** `countries` holds every current ISO 3166-1 country/
  territory with a permanent civilian population (243 rows), sourced
  from CLDR data rather than hand-typed, to avoid the transcription
  errors a ~200-row list invites. Excludes deprecated/historical alias
  codes (e.g. Burma→Myanmar, Zaire→DR Congo), pseudo-regions that aren't
  places (EU, UN, Eurozone), and uninhabited territories (Antarctica,
  Bouvet Island, etc.) — see `db/seed_countries.sql`'s header for the exact
  list. Includes `XK` (Kosovo), which isn't formally ISO-assigned but is
  CLDR/EU/SWIFT-recognized and near-universal in real country dropdowns.
  `members.country_id` is nullable — the active-voter CSV has no country
  field, so seeded members have no country set.
- **Other categorical fields are still fixed enums, scoped to what's
  seeded.** `business_category` (6 values), `blog_category` (4 values),
  and `event_category` (4 values) cover exactly what's in the current
  mock/seed data, not necessarily the full set each will ever need — an
  enum stays the right shape for these since (unlike disciplines) there's
  no known larger authoritative list behind them yet. Add new values with
  `alter type <type_name> add value '...'` as real data needs them — see
  the comment above each type in `db/schema.sql`.
- **"Invited" counts aren't modeled.** The admin dashboard shows "[00]
  going of [000] invited" per event; there's no per-event audience
  targeting yet, so "invited" should be derived as all active members
  until a real invite-list feature is needed.

## How to run this

Target is an independent Postgres database, not a managed
backend-as-a-service. Any Postgres 14+ instance works (self-hosted,
Docker, RDS, etc.):

1. Provision a Postgres database, point `web/.env.local`'s
   `DATABASE_URL` at it (see `web/.env.example`).
2. From `web/`: `npm run db:seed` — applies `db/schema.sql` then every
   `db/seed_*.sql` file via `db/seed.sh`, in the dependency order above
   (disciplines/countries → members/superadmin → businesses/sponsors/blog_posts →
   events/gallery). `db/seed.sh` reads `DATABASE_URL` from the
   environment, falling back to `web/.env.local` if unset.
   To enable gallery uploads, also set `R2_ACCOUNT_ID`,
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and
   `R2_PUBLIC_URL` in `web/.env.local`. Scope the access key to Object
   Read & Write for the gallery bucket; `R2_PUBLIC_URL` should be that
   bucket's public custom domain (or development URL).
3. Confirm: `select count(*) from public_members;` should return 241
   roster members (the separate superadmin is private); `select count(*)
   from disciplines;` should return 24; `select count(*) from countries;`
   should return 243; `select count(*) from businesses;` should return 8.

The initial platform superadmin is seeded as an active, non-public member
and a password login with email `superadmin@biborto11.com`. Set
`SUPERADMIN_PASSWORD` in the environment or `web/.env.local` before running
`npm run db:seed`; the seed stores a bcrypt hash, not the plaintext password.
For a database that already has the superadmin member, set the same variable
and run `npm run db:seed-superadmin` from `web/` to create or reset its
password login without reseeding other data.
For an already-seeded database, apply
`db/migrations/001_google_membership_requests.sql` once before deploying
the Google membership-request flow.
For an already-seeded database that does not have `gallery_videos`, apply
`db/migrations/007_gallery_videos.sql` once before deploying the gallery
video query. It is safe to rerun if the table already exists.

**Re-seeding a non-empty database**: `npm run db:seed` applies
`schema.sql` and the seed files as plain `INSERT`s (not idempotent
upserts) and fails fast (`ON_ERROR_STOP=1`) the moment anything already
exists — by design, so a partial/duplicate seed can't silently happen.
Use `npm run db:reset` instead: it runs `drop schema public cascade;
create schema public;` first (safe even without `DROP DATABASE`
privileges — no `dropdb` needed, so this also sidesteps the
`next-server`-holds-the-connection-open gotcha in the root `CLAUDE.md`),
then seeds from scratch.

## What this does NOT include yet

- **Most core write paths are wired into `web/`.** Auth, member and
  business review/edit, business submission, event RSVP, and admin CRUD
  for events, sponsors, videos and blog posts write to Postgres.
- The current roster is loaded through `db/seed_members.sql`; a superadmin can add
  individual members at `/admin/members/new` or in bulk with the CSV import at
  `/admin/members/import` (a `members` row only — no `users` row
  until the person claims it). There is no open account registration.
- No `activity_log` seed data: the dashboard feed fills as admins and members act
  (`web/lib/activity.ts` writes the rows; see "Activity feed" in docs/web/README.md).
- Gallery R2 configuration is per environment: credentials, bucket name,
  and a public bucket URL must be set before uploads and image display
  work. Upload and photo-management actions check admin/superadmin access
  on the server. Seeded albums contain no photos; albums only show images
  after an admin uploads them. Public gallery tabs switch between photo
  albums and linked YouTube videos; videos without a valid YouTube URL are
  omitted from the public list.
