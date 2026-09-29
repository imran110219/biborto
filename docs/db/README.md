# Data model

Docs for `db/` — paths below are given from the repo root, since this
file lives in `docs/db/` rather than next to the SQL it describes.

The full Postgres schema for the Batch 11 platform, covering every entity
the Next.js app (`web/`) already renders from mock data: members,
businesses, sponsors, events + RSVPs, blog posts, and gallery
albums/photos/videos. Field choices come from `web/lib/types.ts`,
`web/lib/mock-data.ts`, and the admin pages under `web/app/admin/**` —
this isn't a speculative model, it's what the UI already assumes.

## Files

- `db/schema.sql` — the full schema: enums, all tables, indexes,
  `updated_at` triggers, and `public_*` views that expose only
  public-safe columns. See the file's header comment for the auth,
  authorization, and file-storage decisions baked into it.
- `db/seed_disciplines.sql` — Khulna University's discipline reference
  list, codes 01-24 (code, school, name, short code, slug, website
  path), supplied directly as authoritative data, not derived from the
  mockup. Must run before `db/seed_members.sql`.
- `db/seed_countries.sql` — 243 countries/territories for the "current
  country" dropdown: ISO 3166-1 codes and English names sourced from the
  ICU/CLDR data bundled with Node's `Intl.DisplayNames` (generated, not
  hand-typed — see the file's own header for exactly which codes were
  kept vs. dropped and why). Must run before `db/seed_members.sql`.
- `db/seed_members.sql`, `db/seed_businesses.sql`, `db/seed_sponsors.sql`,
  `db/seed_events.sql`, `db/seed_blog_posts.sql`, `db/seed_gallery.sql` — migrate
  every entity in `web/lib/mock-data.ts` into rows, in that dependency
  order (members need disciplines to exist for `discipline_id`,
  businesses need members to exist for `owner_member_id`, sponsors need
  businesses for the optional `business_id` cross-link, blog posts need
  members for `author_member_id`). Each file's header comment flags what
  the mock data doesn't actually specify (e.g. exact years for
  event/post dates, business contact info) rather than inventing it
  silently. `activity_log` has no seed data — no source for it in
  `mock-data.ts` (activity feed text is hardcoded in the dashboard page
  component). `users`/`accounts`/`sessions` are deliberately never
  seeded either — they're populated at runtime by actually claiming an
  account or signing in, not by a SQL script.

## Entities

| Table | What it is |
|---|---|
| `users`, `accounts`, `sessions`, `verification_tokens` | Login identity (Phase 2, built) — shaped to match `@auth/drizzle-adapter`'s expected schema so Auth.js (next-auth v5) can be pointed at them directly, plus `password_hash` on `users` for credentials sign-in, which the adapter doesn't provide. See `docs/web/README.md`'s Auth section. |
| `disciplines` | Khulna University's discipline reference list (codes 01-24), grouped by `school`. A real table, not an enum — see "Disciplines are a reference table" below. |
| `countries` | ISO 3166-1 countries/territories for the "current country" dropdown. Same reasoning as `disciplines` — see "Countries are a reference table" below. |
| `members` | The alumni directory / profile data. `slug` powers `web/app/members/[slug]`. `discipline_id` references `disciplines`; `country_id` (nullable) references `countries`. `user_id` links to `users` once a member logs in; can exist without one (committee-entered). |
| `businesses` | Alumni-run Business Directory listings, self-submitted, approve/reject workflow (`status`, `reviewed_by`, `reviewed_at`). |
| `sponsors` | Committee-curated sponsor tiers. `business_id` is an *optional* cross-link — sponsors are managed independently of the Business Directory, even though several sponsors are also listed businesses. |
| `events`, `event_rsvps` | Reunion/chapter events and member RSVPs (`going` / `interested` / `declined`). |
| `blog_posts` | Draft/published, public/members-only visibility, tags. `body` holds the full article; read time is computed at render time, not stored. `author_name` is a free-text byline fallback for posts with no real member author (e.g. "Reunion committee"). |
| `gallery_albums`, `gallery_photos`, `gallery_videos` | Photo albums (R2-hosted) and a separate video list (YouTube links, not R2). |
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
- **Files live in R2, not Postgres.** Columns named `*_key` (`avatar_key`,
  `cover_photo_key`, `logo_key`, `r2_key`) store the Cloudflare R2 object
  key, not a full URL — the app resolves keys to URLs at render time, so
  a bucket/domain change never touches stored data.
- **Sponsors are not businesses.** 5 of the current 5 mock sponsors
  happen to match businesses by name — a sponsor is often also a
  batchmate's business — but the site's design (see `docs/site/README.md`)
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
  yet — `Avatar` (`web/components/ui/Avatar.tsx`) only ever displays
  initials, and no R2 base URL is configured anywhere to turn a key into
  an actual image src. Data is ready; rendering isn't built.
- **`platform_role` is `member`/`admin`/`superadmin`, not
  `member`/`editor`/`admin`.** Changed on request; the 2 seeded
  `'editor'`s (Rafiul Islam, Arif Khan) remapped to `'admin'` (kept their
  elevated access, new tier name) and the 1 seeded `'admin'` (Tahmina
  Akter) remapped to `'superadmin'` (top-level control) — see
  `db/seed_members.sql`'s comment for the reasoning.
- **Disciplines are a reference table, not an enum.** They started as a
  12-value `member_discipline` enum scoped to the mock data — reasonable
  when that was all the data available. Given Khulna University's real,
  authoritative discipline list (codes 01-24: code, school, name, short
  code, slug, website path — see `db/seed_disciplines.sql`), a flat enum
  was the wrong shape: `disciplines` is now a proper table, grouped by
  `school` (`school_name` enum, 8 values — KU's own School/Discipline
  structure).
  `members.discipline_id` references it. Cross-checking the mock data
  against the real list also caught 3 near-miss discipline names that
  had drifted from KU's actual naming ("Urban & Rural Planning" vs.
  "Urban **and** Rural Planning", "Electronics & Communication **Eng.**"
  vs. "...**Engineering**", "...Resource **Tech.**" vs.
  "...**Technology**") — `db/seed_members.sql` resolves against the
  authoritative `code`, not by name, specifically to sidestep this class
  of mismatch.
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
  `members.country_id` is nullable — nobody's filled it in yet (see
  `db/seed_members.sql`'s known-gaps note), same as before this was a real
  column.
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

1. Provision a Postgres database.
2. Run `db/schema.sql`, then the `db/seed_*.sql` files in this order:
   disciplines, countries, members, businesses, sponsors, events,
   blog_posts, gallery (e.g., from the repo root: `psql $DATABASE_URL -f
   db/schema.sql -f db/seed_disciplines.sql -f db/seed_countries.sql -f
   db/seed_members.sql -f db/seed_businesses.sql -f db/seed_sponsors.sql
   -f db/seed_events.sql -f db/seed_blog_posts.sql -f
   db/seed_gallery.sql`).
3. Confirm: `select * from public_members;` should return the 12 members
   with only their public fields; `select count(*) from disciplines;`
   should return 24; `select count(*) from countries;` should return
   243; `select count(*) from businesses;` should return 8.

## What this does NOT include yet

- **Wired into `web/` for reads and login, not the rest of the write
  surface.** The public pages query this schema directly via Drizzle ORM
  (see `docs/web/README.md`'s Data layer section), and sign-in/claim-
  account are now real writes against `users`/`members.user_id`. But
  every *admin* page still renders from `web/lib/mock-data.ts` — signing
  in as an admin now genuinely gates *access* to `/admin/**`, but the
  content those pages show still isn't real. Approving a member, editing
  a business, publishing a blog post, etc. still do nothing.
- No admin UI wired to this yet — a generic Postgres client (psql,
  pgAdmin, TablePlus, etc.) works until a real admin panel exists.
- No `activity_log` seed data — no source for it in `mock-data.ts` (the
  dashboard's activity feed text is hardcoded in the page component).
- No R2 wiring — `*_key` columns aren't resolved to real URLs anywhere
  yet, and every one is `NULL` in the seed data (no files have actually
  been uploaded).
