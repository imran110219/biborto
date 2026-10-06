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
There is no open account registration; superadmins add members manually
and export CSV, while CSV import is planned but not built. Gallery images
upload to Cloudflare
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
  signup/actions.ts           Server Actions: requestClaim + completeClaim
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
  admin/gallery/page.tsx
  admin/videos/page.tsx
  admin/settings/page.tsx
  admin/edit-post/page.tsx

components/
  ui/            Atoms: Button, Badge, Avatar, Card, FilterBar, Pagination,
                 PlaceholderMedia, SectionHeader, PageHero, Quote, icons.tsx
  layout/        Header, Footer, PublicLayout, AdminSidebar, AdminLayout
  admin/         AdminStatCard, ApprovalRow
  *.tsx          Domain cards: MemberCard, BusinessCard, EventCard,
                 BlogTeaser, GalleryCards, SponsorStrip, CustomPopup

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

components/BlogBody.tsx   Safe Markdown renderer (react-markdown + GFM) for
                          blog_posts.body — see "Blog editor" below
components/blog/          RichTextEditor (TipTap), CoverImageField,
                          PostContentFields (title + cover + editor + Write/
                          Preview) — shared by the admin and member forms
```

## One real behavior upgrade over the mockup

The mockup's mobile nav/sidebar toggles were a CSS-only hidden-checkbox
hack (no JS was available then). Here they're plain `useState` in
`Header.tsx` / `AdminLayout.tsx` — simpler, and the active-route
highlighting uses `usePathname()` instead of a build-time "which page am
I" flag baked into each HTML file.

The home-page popup (see [Admin popups](#admin-popups)) is a real component
that appears on **every load** of the home page — there is deliberately no
"already seen" memory. `PopupShell.tsx` provides the shared modal chrome
(backdrop/Escape/close button, scroll lock, `aria-modal`, reduced-motion);
`CustomPopup.tsx` builds on it. The popup is its own feature and is not
tied to sponsors: nothing is shown unless a superadmin has activated one.

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
filters `db/schema.sql`'s `public_*` views encode
(members: `status='active' AND is_public=true`; businesses:
`status='active'`; blog posts: `status='published' AND
is_public=true`) rather than selecting from the views directly,
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
the member's `admin`/`superadmin` role, validates JPEG/PNG/WebP/GIF up to
15 MB, uploads with server-only credentials, then saves the key and
uploader in Postgres. Admins can update captions and delete photos;
superadmins can create, edit, and delete empty albums. Public pages resolve
keys through `R2_PUBLIC_URL`. Member profile and cover photos also use R2
(a superadmin can upload for anyone; each member uploads their own from
`/account`).
Configure an R2 bucket, an Object Read & Write API token scoped to that
bucket, and a public custom domain (or `r2.dev` for local development).
The app does not create the bucket or configure its domain.

**Still on mock data**: `lib/mock-data.ts` remains in use for dashboard
activity placeholders, settings, and some inert
controls. Admin CSV import is not implemented; members come from seed
data, manual creation by a superadmin, or a pending request created by an
unmatched Google sign-in. That request does not create an account or
grant access until an admin approves it.

## Admin write surface

Real admin writes include member creation, approval,
suspension/reactivation and editing (superadmin only — see
[Admin members](#admin-members)); business creation, approval/rejection and
editing (superadmin only — see [Admin businesses](#admin-businesses)); and CRUD for events,
sponsors, videos and blog posts. The public business submission form and
event RSVP also write to Postgres. Gallery management lives at
`/admin/gallery`: admins can upload photos, edit captions, and delete
photos; superadmins can also create, edit, and delete empty albums. Video
records have admin CRUD at `/admin/videos` and public cards play linked
YouTube videos in privacy-enhanced embeds. Member CSV import and
settings persistence are not implemented.

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
  `requireSuperadmin()` (members and businesses) or `requireAdminMemberId()`
  (other admin areas) first. `proxy.ts` already keeps non-admins off
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

The gallery upload route and photo actions independently check admin
roles; album mutations require a superadmin. The Gallery page (`/admin/gallery`) is also
behind the `/admin/**` role gate.

**Suggested next tasks**: build admin CSV import for members, then
complete persistence for settings.

## My account (member self-service)

Every signed-in, active member — admin or not — can manage their own record at
**`/account`** (linked as "My account" in the public header and as "My profile"
in the admin avatar menu). Edits go live immediately.

- **Profile** (`updateMyProfile`, `parseSelfProfileForm` in
  `lib/members/form.ts`): bio, short bio, campus name, favorite campus place,
  most memorable event, profession, employer, city, country, LinkedIn/Facebook/
  website links, phone, blood group, date of birth, and the **"show me in the
  public member directory"** switch (off → the public profile 404s and the
  member leaves `/members`). It reuses the admin form (`EditMemberForm
  mode="self"`) and the same validation as the admin side (`parseProfileFields`),
  with length caps.
- **Locked fields:** name, discipline, email, student ID, role and status are
  shown read-only ("managed by the committee") and are never parsed by the
  self-service action, so a crafted request can't change them — tested by
  injecting those fields into a submission. The member being edited always
  comes from the session, never from the request.
- **Photos:** `POST /api/account/photos` (profile or cover, same validation and R2
  layout as the admin route, via the shared `lib/members/photo-upload.ts`);
  it only ever targets the signed-in member. The admin route
  `/api/admin/members/[id]/photos` stays superadmin-only.
- **Password:** `changePassword` requires the current password (a Google-only
  account, which has none, can set one using its live session). Existing JWT
  sessions on other devices stay valid until they expire (Auth.js JWT sessions
  can't be revoked individually).
- **Forgot / reset password:** `/forgot-password` emails a one-time link (hashed
  token, 1 hour, 1-minute resend cooldown, `reset:` namespace in
  `verification_tokens`, separate from the `claim:` tokens) to a *claimed,
  non-suspended* member; `/reset-password` redeems it and sends them to
  `/signin?reset=1`. The reply is identical for unknown, unclaimed and claimed
  emails. The link base comes from `APP_URL`/`AUTH_URL`.
- **Session sync:** `components/SessionSync.tsx` re-fetches the client session on
  route changes while signed out, so the header and admin menu update right
  after a Server-Action sign-in (a soft redirect used to leave "Member login"
  and a "…" avatar showing until reload).
- **My submissions:** see [Member submissions](#member-submissions).
- **Not built yet:** members editing a submission after it is in, and sharing
  photos to the gallery.

## Blog editor

Both the admin post editor (`/admin/edit-post/new` and `/[id]`) and the member
submit form (`/blog/submit`) use one writing surface, `PostContentFields`:

- **Rich text (WYSIWYG)** — TipTap, with a toolbar for bold, italic, heading,
  subheading, quote, bulleted/numbered lists, links, images, rule, undo/redo.
  The editor's value is **Markdown**: `tiptap-markdown` serialises it into a hidden
  `body` field, so the database still stores plain Markdown text (never HTML),
  existing posts open in the editor unchanged, and server actions needed no new
  format. Form submissions turn newlines into CRLF; the actions normalise to LF.
- **Preview** — a Write / Preview switch renders the current text through the same
  `BlogBody` component the public post page uses, so the preview is what readers
  will see (both panes stay mounted, so switching never loses editor state).
- **Images** — the toolbar's Image button, paste and drag-and-drop upload to R2 via
  `POST /api/blog/images` (any active member; JPEG/PNG/WebP/GIF sniffed by magic
  bytes, ≤ 8 MB) into `blog/<member id>/<uuid>.<ext>` and insert `![alt](url)`; each
  image goes in its own paragraph after the current block and never replaces
  selected text. Members may hold **40** images each (`MAX_BLOG_IMAGES_PER_MEMBER`,
  counted by listing their R2 folder); admins are uncapped. Unused uploads are not
  garbage-collected yet.
- **Cover photo** — `CoverImageField` uploads through the same route and submits
  `coverKey`; the actions store it in `blog_posts.cover_photo_key` after
  `resolveCoverKey` checks it matches `blog/<uuid>/<uuid>.<ext>` **and**, for a
  member, lives in that member's own folder (an admin may attach any blog image).
  The public post page and the home/teaser cards show the cover, falling back to the
  placeholder block.
- **Rendering is safe by construction** (`components/BlogBody.tsx`): Markdown is
  turned into React elements, so raw HTML in a post is shown as inert text, never
  executed — tested with `<script>`, `<img onerror>`, `<iframe>`, `javascript:` and
  `data:` links; links are limited to http(s)/mailto and open in a new tab with
  `rel="noopener noreferrer nofollow ugc"`; images only render when their URL starts
  with the R2 `blog/` base (`getBlogImageBase()`), so external hosts, look-alike
  hosts and tracking pixels are dropped.
- Dependencies: `@tiptap/*` v2, `tiptap-markdown`, `react-markdown`, `remark-gfm`
  (installed with pnpm, which is what `node_modules` and `pnpm-lock.yaml` use).

## Member submissions

Members can contribute in exactly two ways, and only by **submitting** — they
never publish or edit content themselves. Every submission goes through the
committee, and members follow each one's status under "My blog posts" and "My
businesses" on `/account` (read-only).

- **Blog posts** (`/blog/submit`, `submitPost`): title, category, an optional cover
  photo, a rich-text body written in the [blog editor](#blog-editor) (100–20,000
  characters of Markdown) and up to 8 tags. Stored as `status =
  'pending'` with the member as author, `is_public = true`, never featured. A
  member may have **at most 5 posts pending** at once (`MAX_PENDING_POSTS_PER_MEMBER`
  in `lib/blog/limits.ts`). Admins review them from the blog list (Approve /
  Reject buttons) or the dashboard "Blog submissions" panel: approve →
  `published` (publishes publicly, keeping any existing `published_at`), reject →
  `rejected`. Public queries only ever return `published` + `is_public` posts, so
  pending and rejected posts are invisible and 404 by URL.
- **Businesses** (`/business/submit`, `submitBusiness`): unchanged form, now
  capped at **2 listings per member** (`MAX_BUSINESSES_PER_MEMBER` in
  `lib/businesses/limits.ts`). Pending and active listings count; a rejected
  listing frees its slot. The page shows "x of 2 used" and, at the limit, an
  explanation instead of the form. Listings a superadmin creates for a member
  also count toward the cap, but the admin form itself isn't limited.
- **Race-safe caps:** both limits are checked and the row inserted in one
  transaction holding a per-member advisory lock (`pg_advisory_xact_lock`).
  Without the lock, 8 simultaneous submissions all succeeded in a test; with it,
  exactly the allowed number did.
- **Active members only:** submitting re-reads the member's status from the
  database (`getActiveSessionMemberId`), so a member suspended while still
  holding a login session is refused with a message.

## Admin members

Permissions: **admins have view-only access** to member profiles; every
member mutation is **superadmin-only**. This is enforced server-side
(`requireSuperadmin()` in the Server Actions and the photo/export routes)
and mirrored in the UI by hiding the controls, so calling an action
directly as an admin still fails.

| Surface | Route / file | Who |
|---|---|---|
| List with search, filters, pagination | `/admin/members` | admin, superadmin |
| Read-only profile (all fields incl. private) | `/admin/members/[id]` | admin, superadmin |
| Edit (every `members` column except `slug`/`email`) | `/admin/members/[id]/edit` | superadmin (others redirect to the view page) |
| Add member | `/admin/members/new`, `createMember` | superadmin |
| Approve / reject / suspend / reactivate, bulk activate/suspend | list + dashboard, `actions.ts` | superadmin |
| Profile/cover photo upload | `/api/admin/members/[id]/photos` | superadmin |
| Export CSV | `/api/admin/members/export` | superadmin |

**List filters** live in the URL — `?q=&status=&discipline=&role=&page=` —
so views are shareable and the page stays a plain Server Component.
`lib/members/filters.ts` validates the params (shared by the list and the
export); `getAdminMembersPage` applies them in SQL (search matches name,
email, student ID or city, with LIKE wildcards escaped) and paginates 25
per page. The dashboard still uses the unfiltered `getAdminMembers`.
Checkbox selection for bulk actions is per page.

**Add member** creates a roster row only — **no login account**. The person
claims it later at `/signup`, which links the existing row by email.
Defaults: `active`, role `member`, public. Name and email are required;
email is stored lowercase and checked case-insensitively for duplicates
(sign-in matches on `lower(email)`); a unique-violation race is caught at
insert. The slug is generated from the name with `-2`, `-3`… on collision.
The creator is recorded in `reviewed_by`/`reviewed_at`. Photos are uploaded
after creation, from the edit page.

**Edit** shares its parsing/validation with Add (`lib/members/form.ts`):
URLs must be http(s), blood group must be a valid enum value, date of birth
must be a real, non-future date. A superadmin can't change their own role
or status; changing a member's status records the reviewer. The form
submits via `onSubmit` rather than the `action` prop because React resets
uncontrolled fields after an action, which would wipe the form on a
validation error. The Access & visibility card sits in the page sidebar,
outside the `<form>` element, and joins it with the `form="member-edit-form"`
attribute.

**Export CSV** downloads every row matching the current filters (not just
the visible page), including admin-only fields (phone, student ID, blood
group, date of birth) — hence superadmin-only. UTF-8 with BOM so Excel
renders Bangla names; cells starting with `=`, `+`, `-` or `@` are prefixed
with `'` so they can't execute as spreadsheet formulas (a `+880…` phone
therefore exports as `'+880…`).

**Admin top bar**: an avatar dropdown (My profile, View public site, Sign
out). My profile needs `memberId`, which `auth.ts` puts in the JWT/session
at sign-in — sessions created before it existed must sign in again. It goes
to the edit page for superadmins and the view page for admins.

## Public visibility (`is_public`)

Blog posts, events, gallery albums and gallery videos share one flag,
`is_public` (default `true`). **Public** means available on the public site —
the landing page, the list pages and the item's own page. **Private** (false)
means hidden from everyone but admins: it disappears from the landing page and
lists, its own page returns 404, and it stays visible (with a "Private" badge)
in the admin lists. Blog posts still have their separate draft/published
`status`; a post is public only when it is *published and* `is_public`. This
replaced the blog's old `visibility` (public/members_only) column — there is no
members-only tier.

- **Queries split public from admin.** Public functions filter on `is_public`
  (`getUpcomingEvents`, `getEventBySlug`, `getGalleryAlbums`, `getAlbumBySlug`,
  `getGalleryVideos`/`getPublicVideos`, the blog `publicFilter`); admin
  counterparts return everything (`getAdminUpcomingEvents`,
  `getAdminGalleryAlbums`, `getAlbumBySlug(slug, { includePrivate: true })`,
  `getVideos`, `getAdminPosts`). The admin dashboard's upcoming-events widget
  therefore still lists private events.
- **No leaks through links.** A public album or video that links to a private
  event doesn't show that event's title. Photos inherit their album's
  visibility, and the home "photos in the archive" stat counts only photos in
  public albums.
- **RSVP.** The RSVP action refuses events that aren't public.
- **Admin UI.** One shared `PublicField` checkbox (default on) on the post,
  event, album and video forms, and a `VisibilityBadge` column in each admin
  list. Who may edit each type is unchanged. Saving an event/album/video also
  revalidates `/` so the landing page updates.

## Admin popups

Superadmin-only (`/admin/popups`, hidden from the sidebar for admins; pages
redirect admins to the dashboard; the image route and every action call
`requireSuperadmin()`).

The home page shows **one popup**: the active custom popup, or **no popup
at all** when none is active (`app/page.tsx`) — there is no sponsor or other
fallback. A custom popup is either:

- **Custom HTML** — rendered in an `<iframe sandbox="allow-scripts
  allow-popups allow-popups-to-escape-sandbox" srcdoc=…>` **without**
  `allow-same-origin`. Scripts and CSS animations run, but in an opaque
  origin: the markup can't read this site's cookies, storage or DOM (and the
  site can't read it). Links open in a new tab (`<base target=_blank>`). Max
  50,000 characters; frame height 160–900 px.
- **Image / animated GIF** — uploaded to R2 (`popups/<id>/<uuid>.<ext>`) via
  `/api/admin/popups/[id]/image` (magic-byte sniffing, JPEG/PNG/WebP/GIF,
  15 MB). Animated GIF/WebP play natively (rendered with a plain `<img>`, not
  `next/image`, which would flatten them). Optional alt text and click-through
  link (http(s) only).

An image popup is created inactive and can't be activated until an image is
uploaded (the create action redirects straight to the upload step). At most
**one popup is active** — enforced by a partial unique index; activating one
(on save or via the list button) deactivates the others in a transaction. The
list page says what visitors currently see, and each row has Preview (the
saved version, in the real modal), Edit, Activate/Deactivate and Delete
(which also removes the R2 object). `getActivePopup()` ignores an active
popup that has nothing to render, and a failure loading it (e.g. an
unmigrated table) is logged and simply shows no popup rather than
breaking the home page.

## Admin sponsors

Same permission model as members/businesses: **admins can browse the list
(read-only); creating, editing, toggling, deleting and logo upload are
superadmin-only**, enforced in the Server Actions and the logo route
(`requireSuperadmin()`), with the controls hidden for admins and `/new` and
`/edit` redirecting them back to the list.

- **List** (`/admin/sponsors`): search (name, website or linked business) plus
  tier and status filters, URL-driven (`?q=&tier=&status=`, validated by
  `lib/sponsors/filters.ts`), with a live count and logo thumbnails. Status is
  an explicit on/off switch; delete asks for confirmation.
- **Single active diamond:** Diamond is the one exclusive tier — at most one
  *active* diamond sponsor, enforced by the partial unique index
  `sponsors_one_active_diamond_idx`. Creating, editing or toggling a sponsor
  into "active diamond" first deactivates the previous one in the same
  transaction, and the form warns which sponsor it will replace. Inactive
  diamonds may coexist.
- **Logo:** uploaded on the edit page (create redirects there) to R2 as
  `sponsors/<id>/<uuid>.<ext>` via `/api/admin/sponsors/[id]/logo` (POST
  replaces, DELETE removes; magic-byte validated JPEG/PNG/WebP/GIF, 15 MB).
  Deleting a sponsor or replacing/removing a logo also deletes the old object.
- **Linked business:** the optional `business_id` cross-link is settable in
  the form and shown in the list.
- **Public:** the home page's sponsor strip shows **every** active sponsor
  (diamond first), each as its logo — or initials + name until one is
  uploaded — linking to the sponsor's website when it has one. The strip is
  hidden when no sponsor is active. The events pages' "Sponsored by" banner
  uses `getDiamondSponsor()`, which is now unambiguous.

## Admin businesses

Same permission model as members: **admins are view-only; every business
mutation is superadmin-only**, enforced server-side (`requireSuperadmin()` in
the actions and the export route) and mirrored in the UI.

| Surface | Route / file | Who |
|---|---|---|
| List with search, status/category filters, pagination | `/admin/businesses` | admin, superadmin |
| Read-only listing (all fields, owner, links) | `/admin/businesses/[slug]` | admin, superadmin |
| Edit (all fields + owner + status) | `/admin/businesses/[slug]/edit` | superadmin (others redirect to the view page) |
| Add listing | `/admin/businesses/new`, `createBusiness` | superadmin |
| Approve / reject, bulk approve/reject | list + dashboard, `actions.ts` | superadmin |
| Export CSV | `/api/admin/businesses/export` | superadmin |

Filters live in the URL (`?q=&status=&category=&page=`); `lib/businesses/
filters.ts` validates them for the admin list, the public directory and the
export alike, and `getAdminBusinessesPage` applies them in SQL (search matches
business name, city or owner name; 25 per page). `lib/businesses/form.ts`
holds the shared parse/validation for create and update (http(s)-only links,
email shape, length caps, valid owner/status). **Add listing** creates an
`active` listing by default (committee-entered), with an optional owner
(member picker) and a generated slug (`-2`, `-3`… on collision); member
self-submissions via `/business/submit` still start `pending`. Changing status
on edit records `reviewed_by`/`reviewed_at`. The dashboard's business
submissions panel hides approve/reject for admins (`ApprovalRow readOnly`).

**Public directory** (`/business`) filters are a plain GET form — search
(name, owner or city), category and city (distinct cities of active listings)
— with real pagination (12 per page, `Pagination current/hrefFor`) and an
accurate "Showing x–y of N" line. Only `active` listings are ever returned,
whatever `status` is in the URL. Note the seeded businesses reference owner
names that aren't in the member roster, so their owner is empty until set.

## Auth

**Development shortcut**: under `next dev` (never in production — the
button is not rendered and the action throws unless
`NODE_ENV === "development"`), `/signin` shows "Dev: sign in as
superadmin". It signs in as `superadmin@biborto11.com` using
`SUPERADMIN_PASSWORD` from the server env (`devSuperadminSignIn` in
`app/signin/actions.ts`); the password never reaches the client. Run
`npm run db:seed` (or `db:seed-superadmin`) first so that login exists.

Email/password and Google, via Auth.js v5 (`next-auth@beta` +
`@auth/drizzle-adapter`). JWT sessions — Auth.js doesn't support database
sessions with the Credentials provider, so both providers use JWT for
consistency rather than splitting strategy per provider.

**There is no public account registration.** `/signup` ("Request
membership" in the UI) lets a person claim an existing `members` row by
email; it does not create an active member account. The committee-managed
roster is currently loaded from `active-voter-list.csv` via
`db/seed_members.sql`; superadmins can add members manually (see
[Admin members](#admin-members)), and CSV import is planned but not
implemented. Claiming is email-verified: enter the email on
file → a one-time link (sha256-hashed token in `verification_tokens`, 1 hour,
single use, sent via Resend — see `lib/email.ts`; without `RESEND_API_KEY` in
dev the link is logged to the server console) → `/signup/verify` sets the
password → creates the `users` row → sets `members.user_id`. The response
never reveals whether an email is on the roster. Gmail members can skip all
this with Google sign-in, which already asserts a verified email. Works for
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
  use R2. Gallery album management, photo captions/deletion, and the
  album/video tabs are implemented. The members and business lists
  (admin and public directory) have real search/filters and pagination, but
  search/filter controls on other pages,
  settings persistence and member CSV import remain unbuilt.
- The seed has 241 active roster members and 0 gallery photos. Country
  reference data has 243 rows, while member country fields remain empty.
