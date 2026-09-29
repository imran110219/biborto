# Batch 11 — web (Next.js port)

A real, componentized Next.js port of the static HTML mockup in `../site/`.
Same design, same content, but built from reusable React components with
Tailwind instead of ~3,000-line one-line HTML files with duplicated inline
styles.

## Why this exists

`../site/` is a faithful but static HTML/CSS mockup — hand-duplicated
markup per page, no components, no data model. This project is the
"reflect the UI, then build it properly" step: every page, card, badge,
and layout from the mockup ported into typed, reusable components, driven
by a single mock-data file instead of copy-pasted content. It's still
100% static output — see [Build output](#build-output) — the goal here
was componentization first; the backend is Phase 3 (see [Data
layer](#data-layer)): this same Next.js app's Route Handlers, an
independent Postgres database (`../db/` has the schema sketch,
provider-agnostic — not Supabase), and Cloudflare R2 for file storage
(avatars, gallery media, business photos).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — theme tokens in `app/globals.css` `@theme` block,
  copied 1:1 from `../site/DESIGN.md`'s color/type/spacing system
- **next/font/google** for Fraunces + Instrument Sans — same fonts as the
  mockup, but a few KB instead of the mockup's ~600KB self-hosted
  base64 `@font-face` block
- No backend, no database — see [Data layer](#data-layer)

## Structure

```
app/
  page.tsx                    Home
  members/page.tsx            Member directory
  events/page.tsx             Events
  gallery/page.tsx            Gallery & videos
  blog/page.tsx                → redirects to the one seeded post
  blog/[slug]/page.tsx         Blog post detail (dynamic route, SSG)
  business/page.tsx           Business Directory
  business/[slug]/page.tsx    Business detail (dynamic route, SSG)
  signin/page.tsx             Sign in
  admin/page.tsx               → redirects to /admin/dashboard
  admin/dashboard/page.tsx
  admin/members/page.tsx
  admin/businesses/page.tsx
  admin/sponsors/page.tsx
  admin/edit-post/page.tsx

components/
  ui/            Atoms: Button, Badge, Avatar, Card, FilterBar, Pagination,
                 PlaceholderMedia, SectionHeader, PageHero, Quote, icons.tsx
  layout/        Header, Footer, PublicLayout, AdminSidebar, AdminLayout
  admin/         AdminStatCard, ApprovalRow
  *.tsx          Domain cards: MemberCard, BusinessCard, EventCard,
                 BlogTeaser, GalleryCards, SponsorStrip, DiamondPopup

lib/
  types.ts       Member, Business, Sponsor, EventItem, BlogPost
  mock-data.ts   The mockup's sample content, typed — swap this file's
                 exports for real data-fetching later; every page already
                 consumes it by import, not by prop-drilling from a
                 higher level, so the swap is localized per page.
  fonts.ts       next/font/google setup
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

Everything renders from `lib/mock-data.ts` — the exact 12 members, 8
businesses, 5 sponsors, and 4 events already seeded in `../db/seed_members.sql`
for whenever a real backend exists. There is intentionally no fetching,
no loading states, no API routes yet.

**Phase 3 (decided, not started)**: this app becomes both frontend and
backend — Next.js Route Handlers in this same project query an
independent Postgres database (no Supabase; see `../db/`) directly, and
file-type fields (avatars, gallery media, business photos) resolve to
Cloudflare R2 object URLs instead of local placeholder paths. The swap:
replace the imports from `lib/mock-data` with real data-fetching calls in
each `page.tsx`, keeping every component below the page level unchanged,
since they were all built to take typed props, never to read mock data
directly.

## Build output

```bash
npm install   # registry.npmjs.org is blocked on this network — see .npmrc,
              # which points installs at registry.npmmirror.com instead
npm run build
```

Every route in `app/` — including all `generateStaticParams()`-driven
dynamic routes — builds as static (`○`) or SSG (`●`) output. No
`output: "export"` in `next.config.ts` though: Route Handlers stay
available in this same project for Phase 3 (see [Data
layer](#data-layer)), without requiring a config change or a project
restructure first.

## Known gaps vs. the mockup

- A handful of Tailwind arbitrary values (`h-[52px]`, `w-[104px]`, etc.)
  stand in for exact mockup pixel values that don't land on Tailwind's
  default spacing scale — intentional precision, not leftover cruft.
- Only one real blog post and one real business detail exist as content
  (matching the mockup); the other blog/business slugs render a
  placeholder body so the routing/SSG structure is provably real ahead
  of a real content-authoring flow.
- No forms actually submit (sign-in, business submission, filters) —
  same as the mockup; wiring these depends on the backend decision
  in Phase 3.
