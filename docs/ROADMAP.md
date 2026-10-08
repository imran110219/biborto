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
- ~~Google sign-in with no matching member files a pending request~~ — removed: registration is closed, an
  unknown Google email now records nothing (see §7, "Member onboarding").
- Case-insensitive email matching across sign-in, claim, and Google
  account linking.
- `members.discipline_id` is nullable (a record can exist before its discipline is known), plus
  a superadmin seed (`db/seed_superadmin.sql`).

## 3. Closing the gaps it opened (shipped)

- `getPublicMembers`/`getPublicMemberBySlug` inner-joined `disciplines`
  (a published member with no discipline would silently 404) — now
  `leftJoin` (`lib/db/queries/members.ts`).
- Member edit page — covers every editable `members` column: profile,
  work/location, links, admin-only private details (phone, student ID,
  blood group, date of birth), status, platform role and the
  public-directory toggle (`app/admin/members/[id]/edit`), with photo
  upload. Covers the "set discipline" and "publish toggle" gaps in one form.
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
- Member creation (`/admin/members/new`, `createMember` — now just email + roll, see §7) and
  filtered CSV export (`/api/admin/members/export`).
- Blog index page: `/blog` is now a real list (lead story + card grid, category pills,
  search, pagination, CTA) instead of redirecting to the latest post.
- Member blog-draft auto-save in the browser (restore banner, per-member key, cleared on
  submit and sign-out; see "Draft auto-save" in docs/web/README.md).
- Blog editor UI unified: admin and member forms share one layout
  (`PostEditorShell`) — reading-width column + sticky rail on desktop, bottom action
  bar on phones, sticky toolbar, compact cover row — with members seeing fewer
  options (category, tags, Submit). Fixed: a post's byline is now shown.
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
  before activating (mitigated today: an admin-added record always gets its discipline from the roll or
  from the admin, and stays hidden until the person confirms at `/welcome`).

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
- Member CSV import (`/admin/members/import`, superadmin-only): upload → preview of what
  would be added / updated / skipped with per-row reasons → confirm. See "Member CSV
  import" in docs/web/README.md. `db/seed_members.sql` still holds the original
  241-row roster; other records come from manual creation, import, or pending
  nothing else — no one can register themselves.
- Gallery image uploads now go through a Node Route Handler that checks
  for `admin`/`superadmin`, validates JPEG/PNG/WebP/GIF signatures and a
  15 MB limit, stores the object in R2, and inserts its key into
  `gallery_photos`. Public album pages resolve keys through
  `R2_PUBLIC_URL`. R2 credentials and a readable bucket domain still need
  configuration. Admins can edit captions and delete photos; superadmins
  can create, edit, and delete empty albums. The public gallery has
  separate album and video tabs.

## 6. Infrastructure and remaining media work

- Cloudflare R2 — gallery, member profile/cover, blog image, popup and sponsor logo upload and display
  are implemented, but credentials and the public bucket domain must be
  configured. Business image upload/rendering is not implemented.
- Google OAuth — provider code exists and local client settings are in
  the ignored `.env.local`; the flow still needs end-to-end verification.
  Keep `.env.example` as a placeholder, with no client secret.

## 7. Hardening and completion pass (shipped)

- Security: Postgres-backed rate limiting (sign-in per email+IP / email / IP, reset and
  claim emails, password change, photo upload); live role/status re-check so demotion
  or suspension applies immediately; Google Analytics only after consent and never on
  token routes; nonce-based CSP and security headers via `proxy.ts`; custom popup HTML
  served from its own sandboxed `/popup-frame/[id]` document. See "Security hardening"
  in docs/web/README.md.
- Public `/members` directory: real search (name, profession, company, city),
  discipline and city filters built from published data, 24-per-page pagination.
- Events: working Upcoming / Past tabs, real "N going" counts, `.ics` "Add to
  calendar" (`/events/[slug]/calendar.ics`), past events stay viewable with RSVP closed
  (the action also rejects past or private events).
- Member account is three tabs — Profile, Submissions & events, Security — with a
  "My events" list (cancel upcoming RSVPs) and an avatar dropdown in the navbar.
- Admin Settings is real (`site_settings`, superadmin-only edit, seeded by
  `db/seed_site_settings.sql`): batch name, institution, motto, theme colours and intro texts (so the
  site's identity is no longer hard-coded), contact email, YouTube/Facebook links (footer) and the reunion fee/deadline that fill
  the `[AMOUNT]`/`[DEADLINE]` markers in the reunion post and event text. Footer
  links that had nowhere to go are shown only when configured.
- Dashboard: real "Recent activity" feed (`activity_log`, written by `lib/activity.ts`
  on approvals, submissions, member creation, events and settings), real photo/video
  counts, greeting from the signed-in name; the dead "Export report" button is gone.
- Home page: the hero headline is the batch motto ("One as an individual, united as one",
  editable in Settings), the "Next gathering" card shows the real next event, and the
  events/gallery/videos sections hide themselves when empty.
- Blog post share buttons (copy link, share by email) work; mock-only `lib/mock-data.ts`
  and bracketed placeholder captions were removed.
- Database cleanup (pre-production): the 15 incremental migrations were folded into `schema.sql` and
  removed (verified identical); seeds are split into core vs sample (`db:seed:core` for production);
  stale mockup wording removed from schema and seeds.
- `server/init-db.sh` (+ `web/scripts/init-db.mjs`, shipped in the Docker image): one-command, one-transaction
  first-time production database setup — schema, core seed and the superadmin login — that refuses a
  non-empty database.
- Member onboarding, closed registration: an admin adds just an **email + roll** (discipline derived from the
  roll) or imports a CSV; the person activates with Google or a verified-email link and confirms their name at
  `/welcome` before being listed; unknown Google emails create nothing; admin list flags "Not signed in yet";
  profile-progress card on `/account`. See "Member onboarding" in docs/web/README.md.
- Tests: Vitest unit, integration and smoke suites (`npm test`, `npm run test:integration`,
  `npm run test:smoke`) and a CI job that seeds a database, builds and smoke-tests the app before the
  image is published. See "Testing" in docs/web/README.md.
- Second audit pass: password forms submit by POST so credentials can't land in the URL before
  hydration; rate limits added for submissions, blog image upload (also race-free quota), RSVPs and
  CSV import; home, profile and dashboard queries no longer load every row; stale Edge-runtime
  statements removed from the docs.

## 8. Nice-to-have suggestions (not built)

Ideas that would improve the site but are not required for the existing features to
be complete. Pick from here deliberately; none is committed work.

**Members**
- CSV import extras: downloadable error report for skipped rows, matching by student ID
  as well as email, and bulk-importing photos.
- Self-serve "request a correction" form for fields members can't edit themselves.
- Birthday / "joined this month" highlights on the home page.

**Events**
- Event banner image (needs a column plus R2 upload, then replaces the neutral tile).
- Capacity limits, waitlist, and an "interested" state alongside "going".
- Admin RSVP list with CSV export; reminder emails the day before.
- Recurring or multi-day events.

**Communication**
- Email notifications to admins for new business and blog submissions (the removed Settings "Notifications" toggles were never wired up; they
  need a mail queue and per-admin preferences first).
- Email the author when their post or listing is approved or rejected, with the reason.
- Announcement banner / newsletter digest of new posts and events.

**Content**
- Business images/logo upload (R2) and a "claim this listing" flow.
- Blog comments or reactions (needs moderation tooling), post scheduling.
- Gallery: bulk upload progress, album cover picker, member photo tagging.
- Site-wide search across members, posts, events and businesses.

**Admin**
- Move the remaining static "Batch 11" prose (Privacy/Terms text, some headings and
  descriptions) onto the settings too, and let the committee edit those legal pages.
- Field-level audit trail (who changed what), beyond the activity feed's summaries.
- Admin activity feed filters and an "export report" (the old placeholder button).
- Bulk actions for blog posts; role-change confirmation with reason.

**Engineering**
- Browser-level end-to-end tests (Playwright) for sign-in, RSVP, submitting a post, the CSV
  import screen; more unit tests as logic moves out of server actions.
- A migration runner that records applied files (once `db/migrations/` has files — it's empty until the
  first production deploy), and a health-check endpoint for the container.
- Error reporting (Sentry or similar) and uptime monitoring.
- Move rate limiting to Redis if the site ever runs on multiple instances.
- Accessibility audit (keyboard paths for menus, focus management in dialogs) and a
  Lighthouse performance pass on the home page.
