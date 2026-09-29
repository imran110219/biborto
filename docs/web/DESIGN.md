# Design system — Batch 11 web

Reference for the visual language `web/` renders with — this file lives in
`docs/web/`, not next to the code. Every value below is a live Tailwind v4
theme token: they live in `web/app/globals.css`'s `@theme` block (`--color-*`,
`--font-*`), not hard-coded per component. This document was originally
reverse-engineered from a static HTML mockup (`site/`, since removed once the
Next.js port in `web/` fully superseded it); the values are unchanged, but
this version describes the real Tailwind tokens, not inline styles in dead
markup.

## Layout

- Page shell: `header` (84px tall) → stacked `section`s → `footer` (public
  pages), or a `264px` fixed sidebar + main column (admin pages).
- Horizontal page padding: **80px** on public pages, **40px** on admin main
  content, **20px** in the admin sidebar.
- Section vertical rhythm: big gaps between sections are **96px** top
  padding; content within a section stacks with **40px** gap.
- Cards/grids commonly use **24px** gap; tighter clusters use **12–16px**;
  icon-to-text gaps are **6–10px**.
- A handful of Tailwind arbitrary values (`h-[52px]`, `w-[104px]`, etc.) stand
  in for exact pixel values that don't land on Tailwind's default spacing
  scale — intentional precision, not leftover cruft.

## Color palette

Token names below are the actual `--color-*` custom properties in
`web/app/globals.css`.

| Token | Hex | Usage |
|---|---|---|
| `bg-public` | `#F5F2EA` | Public page background |
| `bg-admin` | `#F7F5F0` | Admin page background |
| `text-primary` | `#1A1F1B` | Headings, body text |
| `text-secondary` | `#5A635D` | Meta text, labels, captions |
| `text-muted` | `#4E5751` | Lead paragraphs |
| `text-article` | `#2A302C` | Article body copy |
| `brand-green` | `#1E4A38` | Primary buttons, links, active nav, icon accents |
| `brand-green-dark` | `#143426` | Footer bg, admin sidebar bg |
| `brand-green-mid` | `#2C5A47` | Sidebar active/hover row |
| `brand-green-tint` | `#E4ECE6` | Icon chips, avatar bg, "Active" badge bg |
| `accent-amber` | `#9A6414` | Eyebrow labels, quote-mark icon, "Pending" badge text |
| `accent-amber-tint` | `#F3E7D1` | Category tag bg, "Pending" badge bg |
| `accent-amber-text` | `#7A4E0E` | Category tag text |
| `diamond` | `#1E4A8C` | Diamond sponsor tier badge text |
| `diamond-tint` | `#E0ECFA` | Diamond sponsor tier badge bg |
| `tier-silver-bg` / `tier-silver-text` | `#E8E8E8` / `#464646` | Silver sponsor tier badge |
| `tier-bronze-bg` / `tier-bronze-text` | `#E9DCCD` / `#784A22` | Bronze sponsor tier badge |
| `border-default` | `#E3DDD0` | Card borders, dividers (public) |
| `border-input` | `#D6CFBF` | Form input / admin borders |
| `placeholder-media` | `#DAD4C5` | Image/photo placeholder blocks |
| `placeholder-media-text` | `#4A524D` | Text/icon on placeholder blocks |
| `video-dark` | `#2B332E` | Video thumbnail background |
| `status-neutral-bg` | `#E6E4E0` | "Suspended" badge bg |
| `status-neutral-text` | `#3E4540` | "Suspended" badge text |

Status/tier badges are pills (`padding: 5px 10px`, `border-radius: 999px`,
`font-size: 13px`, `font-weight: 600`):

| Status | Background | Text |
|---|---|---|
| Active | `brand-green-tint` | `brand-green` |
| Pending | `accent-amber-tint` | `accent-amber-text` |
| Suspended | `status-neutral-bg` | `status-neutral-text` |

| Sponsor tier | Background | Text |
|---|---|---|
| Diamond | `diamond-tint` | `diamond` |
| Gold | `accent-amber-tint` | `accent-amber-text` |
| Silver | `tier-silver-bg` | `tier-silver-text` |
| Bronze | `tier-bronze-bg` | `tier-bronze-text` |

## Typography

`--font-serif` (Fraunces) and `--font-sans` (Instrument Sans), loaded via
`next/font/google` in `web/lib/fonts.ts` — see `docs/web/README.md`'s Stack
section for why that replaced the mockup's self-hosted base64 `@font-face`
block.

- **Fraunces** (serif, display) — weights 500 (normal) and 600 (semibold).
  Headings, section titles, stat numbers, date-badge day numbers, avatar
  initials, pull-quotes.
- **Instrument Sans** (sans, UI/body) — weights 400, 500, 600, 700. Nav, body
  copy, buttons, labels, meta text. Falls back to `system-ui, sans-serif`.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero H1 | Fraunces | 80px | 500 | `line-height:1`, `letter-spacing:-0.025em` |
| Page H1 (e.g. Gallery) | Fraunces | 60px | 500 | `line-height:1.05` |
| Article H1 | Fraunces | 58px | 500 | `line-height:1.08` |
| Section H2 | Fraunces | 44px | 500 | `line-height:1.1`, `letter-spacing:-0.01em` |
| Card H3 (event/member) | Fraunces | 26px | 500 | |
| Article H2 | Fraunces | 32px | 500 | |
| Stat number | Fraunces | 46px | 500 | |
| Sign-in headline | Fraunces | ~40px | 500 | serif on dark green panel |
| Pull-quote | Fraunces | 30px | normal | `color: brand-green` |
| Eyebrow label | Instrument Sans | 13px | 700 | uppercase, `letter-spacing:0.08–0.1em`, `accent-amber` |
| Body / lead paragraph | Instrument Sans | 18–21px | 400 | `line-height:1.55–1.7`, `text-muted` |
| Article body paragraph | Instrument Sans | 19px | 400 | `line-height:1.75`, `text-article` |
| UI text (nav, buttons, labels) | Instrument Sans | 14–16px | 500–700 | |
| Meta / caption text | Instrument Sans | 13–14px | 400–600 | `text-secondary` |

## Shape & elevation

- **Pills** (`border-radius: 999px`): buttons, nav items, category/status/tier
  badges, date chips, tab switchers, search input — the dominant shape.
- **Cards**: `border-radius: 16–20px` (18px most common), white background,
  `1px solid border-default`, no box-shadow anywhere — depth comes from flat
  color contrast, not shadows.
- **Media/placeholder blocks** (`PlaceholderMedia` component): `border-radius:
  14–20px`, filled with `placeholder-media` and a centered icon + bracketed
  label caption.
- **Avatars** (`Avatar` component — initials only today, `avatar_key` not yet
  rendered, see `docs/web/README.md`'s Data layer section): circular,
  `brand-green-tint` bg + `brand-green` initials (public), or `brand-green` bg
  + cream initials (header logo mark, admin user chip uses amber-tint
  instead).
- No shadows/blur anywhere in the design — flat, editorial, paper-like.

## Iconography

`web/components/ui/icons.tsx` — inline SVG only (no icon font/sprite sheet),
`24x24` viewBox, `stroke="currentColor"`, `stroke-width="1.8"`, rounded caps/
joins.

- Rendered sizes: 15–18px inline with text, 22–26px standalone, larger (34px)
  for the pull-quote mark.
- Icons inherit text color via `currentColor` — no separate icon color system
  beyond that.

## Recurring components

- **Header (public)** (`Header.tsx`): logo mark (circular "11" + wordmark) —
  pill nav (active item gets `brand-green-tint` bg + `brand-green` text) —
  "Member login" pill button (dark bg, cream text).
- **Section header pattern** (`SectionHeader.tsx`): eyebrow label + Fraunces
  H2 on the left, a "view all →" text link on the right — identical on every
  content section across Home/Members/Events/Gallery.
- **Event card** (`EventCard.tsx`): white card, date badge (rounded rect,
  day/month split, `brand-green-tint` bg), category pill (amber), Fraunces H3
  title, meta rows with icon + text, "View details →" link pinned to bottom
  via `margin-top: auto`.
- **Member/Business card** (`MemberCard.tsx`, `BusinessCard.tsx`): circular
  initials avatar (96px), name + discipline/category, two meta rows with
  small icons, "View profile" pill button (outline style). Business cards
  reuse the member-card shape exactly, with a category tag swapped in for the
  discipline line.
- **Blog** (`BlogTeaser.tsx`): one large featured card (image + tag + Fraunces
  H3 + byline) beside a list of smaller rows. Article detail page: 820px-wide
  centered column, breadcrumb, H1, lead, byline row with share icon-buttons,
  then H2 sections / body / pull-quotes. Business detail page reuses this
  structure — a testimonial blockquote stands in for the pull-quote, and a
  bordered contact-info card (phone/email/location) replaces the tag row.
- **Gallery** (`GalleryCards.tsx`): pill tab switcher ("Photo albums" /
  "Videos") + an "Upload photos" primary button; album cards (image + title +
  count); video cards (dark thumbnail, circular play button, duration badge).
- **Stats bar**: full-bleed `brand-green` background band, 4-column grid
  (5-column on the admin dashboard, for the Business listings tile) of
  Fraunces numbers over small caption labels in a lighter green tint.
- **Forms** (search/filter bars, sign-in, admin tables): white/transparent
  inputs, `border-input` 1px border, `12px` radius (`10px` in admin), `48px`
  tall (`44px` in admin), label above input in `13px semibold text-secondary`.
- **Footer** (`Footer.tsx`): full-bleed `brand-green-dark`, 4-column link grid
  over a bottom bar divider, all text in cream/tint greens.
- **Admin shell** (`AdminLayout.tsx`, `AdminSidebar.tsx`): `brand-green-dark`
  sidebar (264px) with icon+label nav rows (active = `brand-green-mid` bg), a
  user chip pinned to the bottom; main column has a topbar (search input +
  icon buttons + primary "Create new" button) then stat-tile grids
  (`AdminStatCard.tsx`) and list panels (`ApprovalRow.tsx`).
- **Diamond sponsor**: a single exclusive top tier above Gold — badge color
  is the cool `diamond`/`diamond-tint` pair, distinct from the warm Gold/
  Silver/Bronze palette, to read as more premium. Exclusivity is a content
  convention, not an enforced rule — nothing in `db/schema.sql` prevents a
  second Diamond-tier sponsor. `DiamondPopup.tsx` shows a once-per-visit
  welcome modal (real `useEffect` + `sessionStorage`, see
  `docs/web/README.md`'s "One real behavior upgrade" section).

## Responsive

Handled by real Tailwind responsive classes (`sm:`/`md:`/`lg:` variants), not
a separate stylesheet — a hard requirement dropped once the port left inline
styles and attribute-selector CSS hacks behind. No fixed desktop-only canvas
either: components are written mobile-first like any other Tailwind app.
