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
- Member edit page — sets discipline, platform role, profession,
  employer, city, and the public-directory toggle
  (`app/admin/members/[id]/edit`). Covers the "set discipline on a
  Google-origin request" and "publish toggle" gaps in one form.
- Reactivate action for suspended members, plus per-row
  approve/reject/suspend/reactivate directly on the members list, not
  just the dashboard widget.
- Bulk activate/suspend for members, bulk approve/reject for
  businesses — both via a `form`-attribute checkbox pattern, no client
  JS (`app/admin/members/page.tsx`, `app/admin/businesses/page.tsx`).
- Business edit page for all listing fields
  (`app/admin/businesses/[slug]/edit`).
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
- **Member creation/import is still missing.** `db/seed_members.sql`
  contains the 241-row active-voter roster, but there is no admin UI for
  creating a member manually or importing an updated CSV. Current member
  records come from seed data, with pending records also created by
  unmatched Google sign-in attempts. No open account registration is
  available.
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
