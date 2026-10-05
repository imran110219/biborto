# Batch 11 — web (Next.js port)

Docs for `web/` — this file lives in `docs/web/`, not next to the code
it describes. Paths below are relative to `web/` unless they start with
`docs/` or name another top-level folder (`db/`) explicitly.

A real, componentized Next.js app. Originally a port of a static HTML
mockup (`site/`, removed from the repo once this port fully superseded
it) — same design, same content, but built from reusable React
components with Tailwind instead of ~3,000-line one-line HTML files with
duplicated inline styles. The design system that survived the removal
lives in `docs/web/DESIGN.md`.

## Why this exists

The original `site/` was a faithful but static HTML/CSS mockup —
hand-duplicated markup per page, no components, no data model. This
project was the "reflect the UI, then build it properly" step: every
page, card, badge, and layout from the mockup ported into typed,
reusable components. The
public, unauthenticated pages (home, members, business directory, events,
blog, gallery) render from a real independent Postgres database (no
Supabase) — see [Data layer](#data-layer). Sign-in/sign-up are real too
(email+password and Google, see [Auth](#auth)) and gate `/admin/**` for
real. Member and business approval are real writes now too — see
[Admin write surface](#admin-write-surface). Admin CRUD also writes
events, sponsors, videos and blog posts; business submission and event
RSVP are real. The 241-member seed is based on the active-voter CSV.
There is no open account registration; admin manual member creation and
CSV import are planned but not built. Gallery images upload to Cloudflare
R2 through an admin-only server route and display from the bucket's public
domain. Configure R2 variables in `.env.local` before uploading. Other
media types are not wired to R2 yet.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — theme tokens in `app/globals.css` `@theme` block,
  documented in `docs/web/DESIGN.md`
- **next/font/google** for Fraunces + Instrument Sans — same fonts as the
  mockup, but a few KB instead of the mockup's ~600KB self-hosted
  base64 `@font-face` block
- **Drizzle ORM** (`postgres-js` driver) for the public pages' reads — see
  [Data layer](#data-layer).
- **Auth.js v5** (`next-auth@beta` + `@auth/drizzle-adapter`) for
  sign-in — email/password and Google, JWT sessions — see [Auth](#auth).
  Member/business workflows, business submission, event RSVP and admin
  CRUD for events, sponsors, videos and blog posts have real database
  writes. Admin member import and non-gallery media uploads are still
  unbuilt.

## Structure

```
app/
  page.tsx                    Home
  members/page.tsx            Member directory
  members/[slug]/page.tsx     Member profile (dynamic route, SSG)
  events/page.tsx             Events
  events/[slug]/page.tsx      Event detail (dynamic route, SSG)
  gallery/page.tsx            Gallery & videos
  gallery/[slug]/page.tsx     Album detail (dynamic route, SSG)
  blog/page.tsx                → redirects to the one seeded post
  blog/[slug]/page.tsx         Blog post detail (dynamic route, SSG)
  business/page.tsx           Business Directory
  business/[slug]/page.tsx    Business detail (dynamic route, SSG)
  signin/page.tsx             Sign in (email/password + Google)
  signin/actions.ts           Server Actions: credentialsSignIn, googleSignIn
  signup/page.tsx             "Claim your account" — not open registration,
                               see Auth below
  signup/actions.ts           Server Action: claimAccount
  api/auth/[...nextauth]/route.ts   Auth.js's own HTTP endpoints (session,
                                     callback, csrf, etc.) — re-exports
                                     handlers from ../../auth.ts
  admin/page.tsx               → redirects to /admin/dashboard
  admin/dashboard/page.tsx
  admin/members/page.tsx
  admin/members/actions.ts     Server Actions: approveMember, suspendMember
  admin/businesses/page.tsx
  admin/businesses/actions.ts  Server Actions: approveBusiness, rejectBusiness
  admin/sponsors/page.tsx
  admin/events/page.tsx
  admin/photos/page.tsx
  admin/videos/page.tsx
  admin/settings/page.tsx
  admin/edit-post/page.tsx

components/
  ui/            Atoms: Button, Badge, Avatar, Card, FilterBar, Pagination,
                 PlaceholderMedia, SectionHeader, PageHero, Quote, icons.tsx
  layout/        Header, Footer, PublicLayout, AdminSidebar, AdminLayout
  admin/         AdminStatCard, ApprovalRow
  *.tsx          Domain cards: MemberCard, BusinessCard, EventCard,
                 BlogTeaser, GalleryCards, SponsorStrip, DiamondPopup

lib/
  types.ts       Member, Business, Sponsor, EventItem, BlogPost — plus
                 PublicMember/BlogPostDetail, the narrower shapes the
                 real public pages use (see Data layer below)
  mock-data.ts   The mockup's sample content, typed — still what most
                 admin pages and forms render from (see Why this exists)
  fonts.ts       next/font/google setup
  auth/
    require-admin.ts   requireAdminMemberId() — shared by every admin
                       Server Action (members, businesses, ...); restates
                       proxy.ts's role check since a Server Action is
                       directly callable, not just reachable through the
                       page that renders its bound form
  db/
    client.ts    Drizzle instance + pooled postgres-js connection
                 (cached on globalThis so Next dev's hot-reload doesn't
                 open a fresh pool per edit)
    format.ts    DB row → display-string helpers (initials, event/blog
                 date formatting, read-time estimation)
    queries/     One file per entity (members, businesses, sponsors,
                 events, blog, gallery, stats) — each maps rows onto the
                 types in lib/types.ts, so components need zero changes.
                 members.ts and businesses.ts also export admin-facing
                 getAdminMembers()/getAdminBusinesses() (every status,
                 not just the public-safe rows) — see Admin write surface.
    auth-schema.ts   users/accounts/sessions/verification_tokens, hand-written
                     to match @auth/drizzle-adapter's exact expected shape —
                     see Auth below for why this one file isn't generated

drizzle/         Generated by `npm run db:pull` — schema.ts/relations.ts
                 introspected from the live DB. Committed (components
                 import from it), but never hand-edited — see Data layer.
                 Does NOT cover users/accounts/sessions/verification_tokens
                 for querying — those go through lib/db/auth-schema.ts instead.

auth.ts          NextAuth() config: providers, adapter, callbacks, events —
                 see Auth below
proxy.ts         Next.js 16's renamed middleware.ts — gates /admin/** by
                 role, reading it off the session JWT (Edge runtime, can't
                 query Postgres directly)
types/next-auth.d.ts   Module augmentation adding id/platformRole to
                       Session.user and JWT

components/BlogBody.tsx   Tiny hand-rolled renderer for blog_posts.body's
                          markdown subset (## headings, > quotes) — not a
                          full markdown library, since the subset is small
                          and fully within our control
```

## One real behavior upgrade over the mockup

The mockup's mobile nav/sidebar toggles were a CSS-only hidden-checkbox
hack (no JS was available then). Here they're plain `useState` in
`Header.tsx` / `AdminLayout.tsx` — simpler, and the active-route
highlighting uses `usePathname()` instead of a build-time "which page am
I" flag baked into each HTML file.

The Diamond sponsor popup's once-per-visit `sessionStorage` check is now
a `useEffect` in `DiamondPopup.tsx` instead of a hand-written inline
`<script>` — same behavior, real component.

## Data layer

The public pages (home, members + profile, business directory + detail,
events + detail, blog + detail, gallery + album detail) are Server
Components that query Postgres directly via `lib/db/queries/*` — no
Route Handlers involved, since that's the idiomatic App Router pattern
for a page's own read: the
server that renders the page is the same server that can just query the
database. Route Handlers and Server Actions handle mutations and form
submissions where needed. Auth, business submission, event RSVP, member
and business review, and admin CRUD for events, sponsors, videos and blog
posts are wired to Postgres.

**Setup**: copy `.env.example` to `.env.local` and point `DATABASE_URL`
at a Postgres instance loaded with `db/schema.sql` + the `db/seed_*.sql`
files (see `docs/db/README.md`). Then:

```bash
npm run db:pull   # introspects the live DB into drizzle/schema.ts + relations.ts
```

`db/schema.sql` is still the single source of truth for the actual
schema — `drizzle.config.ts` only ever runs `pull` (introspect), never
`generate`/`push`. Whenever `schema.sql` changes, reapply it to your dev
database and re-run `npm run db:pull` to pick up the new columns/types.

**Query layer**: each file under `lib/db/queries/` maps DB rows onto the
existing types in `lib/types.ts` (`PublicMember`, `Business`,
`Sponsor`, `EventItem`, `BlogPost`/`BlogPostDetail`) rather than exposing
Drizzle's generated row types directly to components — so every card
component (`MemberCard`, `BusinessCard`, etc.) needed zero changes.
`PublicMember` is deliberately narrower than the full `Member` type used
by admin pages: it excludes `email`/`platformRole`/`status`/`studentId`
entirely, not just at the UI level — a Server Component's props are
serialized to the client, so including a member's real email in the
returned object would leak it over the wire even though `MemberCard`
never renders it.

**Filtering**: query functions replicate the same `status`/`is_public`/
`visibility` filters `db/schema.sql`'s `public_*` views encode
(members: `status='active' AND is_public=true`; businesses:
`status='active'`; blog posts: `status='published' AND
visibility='public'`) rather than selecting from the views directly,
since several queries also need a join the views don't carry (e.g.
`businesses.owner_member_id` → `members.name`). This incidentally fixed
two real bugs the mockup had: the public member directory and business
directory were rendering *every* mock row regardless of status —
pending/suspended members and pending/rejected businesses included. Real
data now correctly filters them out.

Member queries use a left join for disciplines because Google membership
requests can enter the approval queue before a discipline is known
(`members.discipline_id` is nullable; see the migration noted in
[`docs/db/README.md`](../db/README.md)). The public directory, public
profile, and admin member list display `Not provided` when that relation
is missing, so they can represent these requests without inventing a
discipline.

**Fabricated data replaced with real (empty) fields**: `business/[slug]`
used to fake a phone number and email address at render time (no such
fields existed on the mock `Business` type). Now that `businesses.phone`/
`email`/`website` are real columns, the page renders them for real —
which today means empty, since no business has filled them in yet, so
the page shows "No contact details on file yet" instead of a fabricated
phone number. Not a regression — the mockup's fake number was never real
either.

**A drizzle-kit bug to know about**: `drizzle-kit pull`'s codegen
mis-renders empty-string/empty-array column defaults — `default ''`
produced invalid TypeScript, and `default '{}'` (empty array) silently
became `default([""])` (an array containing one empty string) instead of
`default([])`. `schema.sql` works around this by not giving `body`,
`tags`, or `offerings` any default at all — every current insert already
supplies them explicitly, so nothing depends on it. If you hit the same
codegen error after a schema change, this is almost certainly why.

**File storage (R2)**: gallery uploads are implemented in
`app/api/admin/gallery/photos/route.ts`. The route independently checks
the member's `admin`/`superadmin` role, allows JPEG/PNG/WebP/GIF up to
15 MB, uploads with server-only R2 credentials, then saves the object key
and uploader in Postgres. Album pages turn keys into image URLs using
`R2_PUBLIC_URL`. Configure an R2 bucket, an Object Read & Write API token
scoped to that bucket, and a public custom domain (or `r2.dev` for local
development). The app does not create the bucket or configure its domain.
Avatars, business images and other media are not implemented.

**Still on mock data**: `lib/mock-data.ts` remains in use for dashboard
activity placeholders, settings, and some inert
controls. Admin member creation and CSV import are not implemented;
members currently come from seed data or a pending request created by an
unmatched Google sign-in. That request does not create an account or
grant access until an admin approves it.

## Admin write surface

Real admin writes include member approval, suspension/reactivation and
editing; business approval/rejection/editing; and CRUD for events,
sponsors, videos and blog posts. The public business submission form and
event RSVP also write to Postgres. Gallery images can be uploaded from
`/admin/photos` by admins and superadmins; gallery album creation, photo
deletion, admin member creation/CSV import, and settings persistence are
not implemented.

- **`lib/db/queries/{members,businesses}.ts`** export `getAdminMembers()`/
  `getAdminBusinesses()` alongside the existing public-facing queries —
  every row regardless of status, plus the admin-only columns
  (`email`, `studentId`, `platformRole` for members) `public_members`
  excludes. Safe here since these never flow to a public page — unlike
  `PublicMember`, there's no separate narrower type to enforce it, so
  don't wire one of these into a Server Component that passes props to
  a Client Component without checking first.
- **`app/admin/{members,businesses}/actions.ts`** — `"use server"`
  mutations (`approveMember`, `suspendMember`, `approveBusiness`,
  `rejectBusiness`). Each sets `reviewed_by` (the acting admin's own
  `members.id`, resolved from the session) and `reviewed_at` alongside
  `status`, then `revalidatePath()`s every route the change affects —
  the admin list page, the dashboard, and (for approvals) the public
  page the row now appears on or disappears from (`/members`,
  `/business`).
- **`lib/auth/require-admin.ts`** — every action above calls
  `requireAdminMemberId()` first. `proxy.ts` already keeps non-admins off
  `/admin/**`, but a Server Action is directly callable — reachable
  without ever rendering the page that binds it to a form — so the role
  check (and the acting-admin lookup) is restated here rather than
  assumed from the page having rendered.
- **`components/admin/ApprovalRow.tsx`** — `onApprove`/`onReject` are now
  optional props, each a Server Action pre-bound to a row's id
  (`approveMember.bind(null, m.id)`). Passed where the backing mutation
  exists (members, businesses); omitted elsewhere (e.g. the dashboard has
  no "Event RSVPs" approval queue yet), where the buttons render inert,
  same as before this existed.

The gallery upload route independently checks `admin` and `superadmin`
roles; the Photos page is also behind the `/admin/**` role gate.

**Suggested next tasks**: build admin-only manual member creation and
CSV import, then add gallery album management and photo deletion.

## Auth

Email/password and Google, via Auth.js v5 (`next-auth@beta` +
`@auth/drizzle-adapter`). JWT sessions — Auth.js doesn't support database
sessions with the Credentials provider, so both providers use JWT for
consistency rather than splitting strategy per provider.

**There is no public account registration.** `/signup` ("Request
membership" in the UI) lets a person claim an existing `members` row by
email; it does not create an active member account. The committee-managed
roster is currently loaded from `active-voter-list.csv` via
`db/seed_members.sql`; admin manual member creation and CSV import are
planned, but not implemented. Claiming: enter the email on file and a
password → creates the `users` row → sets `members.user_id`. Works for
`status='pending'` as well as
`'active'` (so a member awaiting approval can have a password ready),
but actually signing in requires `status='active'` — a newly-claimed
pending member's first sign-in attempt correctly fails until approved,
not a bug. A `'suspended'` member can neither claim nor sign in.

Google sign-in has no separate claim step. For an active matching member,
the `events.createUser` callback links `members.user_id` the same way the
credentials claim flow does. A verified Google email with no matching
member creates a private `pending` membership request, but no Auth.js
user or session; this is a request for committee review, not an active
account. The sign-up page offers Google sign-in as well: a verified Google email
matching an active committee member finds that existing profile. Google
email matching is case-insensitive, and a Google account can link to a
previously password-claimed account with the same verified email. If no
member record matches, the app creates a private `pending` member request
using the Google name and email, then denies sign-in until an admin
approves it from the member queue. The initial request has no discipline
or public profile details; admins can collect those before publishing it.

**Role-gating `/admin/**`**: `proxy.ts` (Next.js 16 renamed
`middleware.ts` — the deprecation warning is real, don't ignore it) reads
`platform_role` off the already-decoded session JWT and redirects to
`/signin?callbackUrl=...` unless it's `admin` or `superadmin`. It reads
from the JWT, never queries Postgres directly, because `proxy.ts` runs
on the Edge runtime, where the `postgres` package (a raw TCP driver)
doesn't work — the role is looked up once, in `auth.ts`'s `jwt` callback,
which does run in a normal Node.js context. Consequence: a role change
takes effect on that member's *next sign-in*, not instantly.

**`lib/db/auth-schema.ts` is hand-written, not generated** — the one
deliberate exception to "`db/schema.sql` → `npm run db:pull` →
`drizzle/schema.ts`" that the rest of this app follows strictly.
`@auth/drizzle-adapter` requires an exact TypeScript shape for these 4
tables (particular JS property names like `refresh_token` instead of the
`refreshToken` drizzle-kit's casing option would produce, and
`mode: "date"` timestamps instead of drizzle-kit's default string mode)
that introspection can't reproduce. `db/schema.sql` is still the actual
source of truth for the DDL; if it changes, `auth-schema.ts` needs a
matching hand-edit.

**Tested vs. not**: credentials sign-in/claim/sign-out were verified
against a live server and a real Postgres database — claim a real
account, wrong password rejected, suspended/pending members correctly
blocked from signing in even with the right password, role-based
`/admin/**` gating, sign-out actually clearing the session. Google
sign-in is code-complete but has not been verified end-to-end. Local
OAuth client values belong in ignored `.env.local`; `.env.example` keeps
these variables blank. R2 credentials and the public bucket URL also
belong in `.env.local`, using the `R2_*` variables from the example.

**Not built**: forgot-password (needs an email-sending provider — a
separate infrastructure decision, same shape of gap as R2), and any
member-facing area beyond the public profile pages that already exist —
there's no "my account" or "edit my profile" page yet.

## Build output

```bash
npm install   # registry.npmjs.org is blocked on this network — see .npmrc,
              # which points installs at registry.npmmirror.com instead
npm run build
```

`DATABASE_URL` must point at a live, schema-loaded Postgres for `npm run
build` to succeed now: the public pages' `generateStaticParams()`
functions query it at build time to enumerate blog/business slugs (see
[Data layer](#data-layer)). Every route in `app/` — including those
dynamic routes — still builds as static (`○`) or SSG (`●`) output, same
as before the database existed; only *how* the data gets baked in at
build time changed, not that it does. No `output: "export"` in
`next.config.ts`: Route Handlers are already in use (`api/auth/[...nextauth]`)
and stay available for the rest of the write-path work auth unlocks
(admin content, forms), without requiring a config change or a project
restructure first.

## Known gaps vs. the mockup

- A handful of Tailwind arbitrary values (`h-[52px]`, `w-[104px]`, etc.)
  stand in for exact mockup pixel values that don't land on Tailwind's
  default spacing scale — intentional precision, not leftover cruft.
- Only one real blog post has real article content (matching the
  mockup); the other 3 seeded posts render the same "coming soon"
  placeholder body the mockup always showed for them — see
  `db/seed_blog_posts.sql`.
- Sign-in/sign-up, member and business review, business submission,
  event RSVP, and admin CRUD for events, sponsors, videos and blog posts
  use real database writes. Gallery image upload and public display also
  use R2. Search/filter controls, settings persistence, member
  creation/import, album management and photo deletion remain unbuilt.
- The seed has 241 active roster members and 0 gallery photos. Country
  reference data has 243 rows, while member country fields remain empty.
