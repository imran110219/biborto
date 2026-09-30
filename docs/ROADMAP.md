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

## 3. Closing the gaps it opened (in progress)

Nullable discipline and pending-Google-requests are new surface area;
this is what it shook loose.

- Fixed — `getPublicMembers`/`getPublicMemberBySlug` were still
  inner-joining `disciplines`, so a published member with no
  discipline would silently 404 (`lib/db/queries/members.ts`).
- Open — no admin UI to set a discipline on a Google-origin request,
  or to flip a member public once it's ready.
- Open — `approveMember` doesn't require a discipline before
  activating a request (`app/admin/members/actions.ts`).
- Open — no reject-and-reactivate path for suspended members, no
  field editing after creation, no audit trail beyond `reviewedBy`/
  `reviewedAt`, no bulk actions.

## 4. Public-facing write forms (planned)

Neither of these exists yet, mock included.

- Business submission — "List your business" is a plain link to
  `/signin`, no form (`app/business/page.tsx`).
- Event RSVP — "I'm going" is a plain link to `/signin`, no action
  (`app/events/[slug]/page.tsx`).

## 5. Remaining admin surfaces (planned)

Members and businesses have real reads and writes. Every other admin
section is still the mockup.

- Events, Photos, Videos, Sponsors admin all still render
  `lib/mock-data.ts`; none has an `actions.ts`.
- Blog edit-post — mock post, "Save draft"/"Publish" are inert
  buttons (`app/admin/edit-post/page.tsx`).
- Dashboard's events widget still reads mock data alongside the real
  member/business counts (`app/admin/dashboard/page.tsx`).
- No "create new" flow exists anywhere in admin yet — every Add
  button, in every section, is inert.

## 6. Infrastructure (planned)

Schema-ready, nothing wired up.

- Cloudflare R2 file storage — every `*_key` column is `NULL` in seed
  data, no bucket configured, `components/ui/Avatar.tsx` only ever
  draws initials.
- Google OAuth — code-complete but unverified; `AUTH_GOOGLE_ID`/
  `AUTH_GOOGLE_SECRET` are blank in `.env.example`, no real client
  configured in this environment.
