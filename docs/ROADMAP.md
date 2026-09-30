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
- **Photos (gallery) admin is the one exception, and stays mock**:
  `gallery_photos.r2_key` is `not null`, so an individual photo row
  can't be created without Cloudflare R2 wired up (see §6). Album
  metadata CRUD could ship without R2, but was left alongside Photos
  rather than split out, since "add a photo" is the point of the page.

## 6. Infrastructure (explicitly deferred)

Deferred by decision, not oversight — nothing else in this repo
depends on either being done first except Photos admin (§5).

- Cloudflare R2 file storage — every `*_key` column is `NULL` in seed
  data, no bucket configured, `components/ui/Avatar.tsx` only ever
  draws initials.
- Google OAuth — code-complete but unverified; `AUTH_GOOGLE_ID`/
  `AUTH_GOOGLE_SECRET` are blank in `.env.example`, no real client
  configured in this environment. Doesn't block anything else — a
  session only ever comes from an already-active member either way.
