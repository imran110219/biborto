# Roadmap

Snapshot of what's real vs. mock in `web/` and `db/`, in build order. This
is a snapshot of the working tree, not a commitment — re-derive it from
the code after any significant change rather than trusting it verbatim.
Paths below are relative to `web/` unless another top-level folder is
named.

## 1. Foundation — reads & identity (shipped)

- Public pages query Postgres directly — members, business directory,
  events, blog, gallery (`lib/db/queries/*.ts`).
- Auth.js v5: credentials + Google, JWT sessions, role-gated
  `/admin/**` (`auth.ts`, `proxy.ts`).
- `db/schema.sql` is the single source of truth, normalized
  `disciplines`/`countries` reference data.

## 2. Approval workflows (shipped)

- Member approve/suspend (`app/admin/members/actions.ts`).
- Business approve/reject (`app/admin/businesses/actions.ts`).
- Google sign-in with no matching member now files a pending
  membership request instead of a bare rejection (`auth.ts`).
- Case-insensitive email matching across sign-in, claim, and Google
  account linking.
- `members.discipline_id` made nullable for pending requests, plus
  `db/migrations/001_google_membership_requests.sql` and a superadmin
  seed (`db/seed_superadmin.sql`).

## 3. Closing the gaps it opened (shipped)

- `getPublicMembers`/`getPublicMemberBySlug` inner-joined `disciplines`
  (a published member with no discipline would silently 404) — now
  `leftJoin` (`lib/db/queries/members.ts`).
- Member edit page — covers every editable `members` column: profile,
  work/location, links, admin-only private details (phone, student ID,
  blood group, date of birth), status, platform role and the
  public-directory toggle (`app/admin/members/[id]/edit`), with photo
  upload. Covers the "set discipline on a
  Google-origin request" and "publish toggle" gaps in one form.
- Reactivate action for suspended members, plus per-row
  approve/reject/suspend/reactivate directly on the members list, not
  just the dashboard widget.
- Bulk activate/suspend for members, bulk approve/reject for
  businesses — both via a `form`-attribute checkbox pattern, no client
  JS (`app/admin/members/page.tsx`, `app/admin/businesses/page.tsx`).
- Member permissions: admins have **view-only** access
  (`/admin/members/[id]`); editing, creating, photo upload, approve/
  reject/suspend/reactivate, bulk actions and CSV export are
  **superadmin-only**, enforced in the Server Actions/route
  (`requireSuperadmin`), not just hidden in the UI.
- Member list search, status/discipline/role filters and 25-per-page
  pagination, all driven by URL params (`lib/members/filters.ts`,
  `getAdminMembersPage`).
- Manual member creation (`/admin/members/new`, `createMember`) and
  filtered CSV export (`/api/admin/members/export`).
- Blog rich-text editor (TipTap, stored as Markdown) with Write/Preview, in-body image
  upload (toolbar, paste, drop) and cover photos on both the admin and member forms;
  safe Markdown rendering that ignores raw HTML and only shows our own R2 images.
- Member submissions: members submit blog posts (reviewed → published/rejected;
  max 5 pending) and business listings (max 2 per member, race-safe), and track
  each one's status on `/account`. Admins approve/reject posts from the blog
  list or dashboard. `blog_status` gained `pending` and `rejected`.
- Member self-service (`/account`): edit your own profile and public-directory
  visibility, upload your own profile/cover photos, change your password, plus
  a working forgot/reset-password flow (`/forgot-password`, `/reset-password`)
  and a header "My account" link for every signed-in member. Identity and
  access fields stay admin-only. Also fixed the stale client session after
  sign-in (`SessionSync`) and removed the inert "Keep me signed in".
- Shared `is_public` visibility on blog posts, events, gallery albums and
  videos (private = hidden from everyone but admins; blog's old
  public/members-only `visibility` replaced by it), with a single
  `PublicField` form control and `VisibilityBadge` in the admin lists.
- Sponsors: superadmin-only management (admins read-only), logo upload to R2,
  logos + website links on the home sponsor strip (no more 5-sponsor cap or
  placeholder boxes), searchable/filterable list, delete confirmation,
  optional linked business, and at most one active diamond sponsor
  (`sponsors_one_active_diamond_idx`, auto-deactivating the previous one).
- Home-page popups: superadmin-managed custom HTML (sandboxed iframe) or
  image/animated GIF popups (`/admin/popups`, `popups` table, R2 upload),
  shown on every home-page load; with none active, no popup is shown (the
  old diamond-sponsor popup was removed — popups are their own feature).
- Admin account menu (avatar dropdown: My profile, View public site,
  Sign out) and a development-only one-click superadmin sign-in on
  `/signin`.
- Business edit page for all listing fields plus owner and status
  (`app/admin/businesses/[slug]/edit`).
- Businesses now follow the member permission model: admins view-only
  (`/admin/businesses/[slug]`), superadmin-only edit, add
  (`/admin/businesses/new`), approve/reject, bulk actions and CSV export
  (`/api/admin/businesses/export`). Admin list has URL-driven search,
  status/category filters and 25-per-page pagination; the public directory
  has working search/category/city filters and 12-per-page pagination
  (`lib/businesses/`).
- Still open: no field-level audit trail beyond `reviewedBy`/
  `reviewedAt`; `approveMember` still doesn't hard-require a discipline
  before activating (mitigated today only because a Google-origin
  request is created with `is_public = false`, so an incomplete profile
  can't reach the public directory regardless).

## 4. Public-facing write forms (shipped)

- Business submission — `/business/submit`, gated to signed-in members,
  inserts a `pending` listing (`app/business/submit/`).
- Event RSVP — real going/cancel toggle on the event detail page, and a
  live "N batchmates going" count fed by actual `event_rsvps` rows
  (`app/events/[slug]/actions.ts`, `lib/db/queries/rsvps.ts`).

## 5. Remaining admin surfaces (mostly shipped)

- Events, Sponsors, Videos, Blog posts all now have real list pages,
  create/edit forms, and delete actions
  (`app/admin/{events,sponsors,videos,edit-post}/`). Blog's
  save-draft/publish split preserves `published_at` on re-saves via
  `coalesce(published_at, now())` rather than overwriting it.
- Dashboard's events widget, blog-post count, and RSVP progress bars
  now read live data instead of `lib/mock-data.ts`.
- **Member CSV import is still missing.** `db/seed_members.sql`
  contains the 241-row active-voter roster. Superadmins can now add a
  member manually (`/admin/members/new`) and export the filtered list as
  CSV, but there is no importing of an updated CSV. Other member records
  come from seed data, with pending records also created by unmatched
  Google sign-in attempts. No open account registration is available.
- Gallery image uploads now go through a Node Route Handler that checks
  for `admin`/`superadmin`, validates JPEG/PNG/WebP/GIF signatures and a
  15 MB limit, stores the object in R2, and inserts its key into
  `gallery_photos`. Public album pages resolve keys through
  `R2_PUBLIC_URL`. R2 credentials and a readable bucket domain still need
  configuration. Admins can edit captions and delete photos; superadmins
  can create, edit, and delete empty albums. The public gallery has
  separate album and video tabs.

## 6. Infrastructure and remaining media work

- Cloudflare R2 — gallery and member profile/cover photo upload and display
  are implemented, but credentials and the public bucket domain must be
  configured. Business image upload/rendering is not implemented.
- Google OAuth — provider code exists and local client settings are in
  the ignored `.env.local`; the flow still needs end-to-end verification.
  Keep `.env.example` as a placeholder, with no client secret.
