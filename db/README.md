# Data model

The full Postgres schema for the Batch 11 platform, covering every entity
the Next.js app (`../web/`) already renders from mock data: members,
businesses, sponsors, events + RSVPs, blog posts, and gallery
albums/photos/videos. Field choices come from `web/lib/types.ts`,
`web/lib/mock-data.ts`, and the admin pages under `web/app/admin/**` —
this isn't a speculative model, it's what the UI already assumes.

## Files

- `schema.sql` — the full schema: enums, all tables, indexes,
  `updated_at` triggers, and `public_*` views that expose only
  public-safe columns. See the file's header comment for the auth,
  authorization, and file-storage decisions baked into it.
- `seed_members.sql`, `seed_businesses.sql`, `seed_sponsors.sql`,
  `seed_events.sql`, `seed_blog_posts.sql`, `seed_gallery.sql` — migrate
  every entity in `web/lib/mock-data.ts` into rows, in that dependency
  order (businesses need members to exist for `owner_member_id`,
  sponsors need businesses for the optional `business_id` cross-link,
  blog posts need members for `author_member_id`). Each file's header
  comment flags what the mock data doesn't actually specify (e.g. exact
  years for event/post dates, business contact info) rather than
  inventing it silently. `activity_log` and `users` have no seed data —
  neither has a source in `mock-data.ts` (activity feed text is
  hardcoded in the dashboard page component; there's no auth data at
  all yet).

## Entities

| Table | What it is |
|---|---|
| `users` | Login identity only (Phase 2, not built). Minimal on purpose — expect it to change once an auth approach is chosen. |
| `members` | The alumni directory / profile data. `user_id` links to `users` once a member logs in; can exist without one (committee-entered). |
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
  Server Components querying Postgres directly for reads, Route Handlers
  for writes once Phase 2 auth exists — same as any other Postgres-backed
  app. `users` is a new, minimal placeholder table for login identity
  instead. See `web/README.md`'s Data layer section for how the public
  read paths actually enforce this today.
- **Files live in R2, not Postgres.** Columns named `*_key` (`avatar_key`,
  `cover_photo_key`, `logo_key`, `r2_key`) store the Cloudflare R2 object
  key, not a full URL — the app resolves keys to URLs at render time, so
  a bucket/domain change never touches stored data.
- **Sponsors are not businesses.** 5 of the current 5 mock sponsors
  happen to match businesses by name — a sponsor is often also a
  batchmate's business — but the site's design (see `../site/README.md`)
  treats them as separately curated. `sponsors.business_id` is an
  optional cross-link, not a hard dependency.
- **`blood_group` is members-only, not public.** It's in the `members`
  table but deliberately left out of `public_members` — more sensitive
  than the rest of the public directory card, meant for a members-only
  emergency-donor search, not anonymous visitors.
- **Categorical fields are fixed enums, scoped to what's seeded.**
  `member_discipline` (12 values), `business_category` (6 values),
  `blog_category` (4 values), and `event_category` (4 values) all cover
  exactly what's in the current mock/seed data, not necessarily the full
  set each will ever need. Add new values with `alter type <type_name>
  add value '...'` as real data needs them — see the comment above each
  type in `schema.sql`.
- **"Invited" counts aren't modeled.** The admin dashboard shows "[00]
  going of [000] invited" per event; there's no per-event audience
  targeting yet, so "invited" should be derived as all active members
  until a real invite-list feature is needed.

## How to run this

Target is an independent Postgres database, not a managed
backend-as-a-service. Any Postgres 14+ instance works (self-hosted,
Docker, RDS, etc.):

1. Provision a Postgres database.
2. Run `schema.sql`, then the `seed_*.sql` files in this order: members,
   businesses, sponsors, events, blog_posts, gallery (e.g.
   `psql $DATABASE_URL -f schema.sql -f seed_members.sql -f
   seed_businesses.sql -f seed_sponsors.sql -f seed_events.sql -f
   seed_blog_posts.sql -f seed_gallery.sql`).
3. Confirm: `select * from public_members;` should return the 12 members
   with only their public fields; `select count(*) from businesses;`
   should return 8.

## What this does NOT include yet

- **Wired into `web/` for reads, not writes.** The public pages (home,
  members, business directory, events, blog, gallery) query this schema
  directly via Drizzle ORM — see `web/README.md`'s Data layer section for
  how. Admin pages and every form still render `web/lib/mock-data.ts`;
  none of them can actually write to this schema without Phase 2 auth.
- No admin UI wired to this yet — a generic Postgres client (psql,
  pgAdmin, TablePlus, etc.) works until a real admin panel exists.
- No login (`site/signin.html` is still a static mockup) — that's Phase 2
  (email/password + Google, matching the "Continue with Google" button
  already in the mockup), pending the auth-layer decision in `users`.
- No `activity_log` or `users` seed data — see "Files" above for why.
- No R2 wiring — `*_key` columns aren't resolved to real URLs anywhere
  yet, and every one is `NULL` in the seed data (no files have actually
  been uploaded).
