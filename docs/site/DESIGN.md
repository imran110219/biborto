# Design documentation — Batch 11 · Khulna University

Reference for the visual language used across the static mockup in this
folder, so new pages/components stay consistent. Values were reverse
engineered from the shipped HTML (inline styles) — there is no CSS
framework or design tokens file backing this today.

## Layout

- Fixed desktop canvas: **1440px wide**. Nothing in the markup is
  responsive (no media queries, no fluid breakpoints).
- Page shell: `header` (84px tall) → stacked `section`s → `footer`
  (public pages), or a `264px` fixed sidebar + main column (admin pages).
- Horizontal page padding: **80px** on public pages, **40px** on admin
  main content, **20px** in the admin sidebar.
- Section vertical rhythm: big gaps between sections are **96px** top
  padding; content within a section stacks with **40px** gap.
- Cards/grids commonly use **24px** gap; tighter clusters use
  **12–16px**; icon-to-text gaps are **6–10px**.

## Color palette

| Token (suggested name) | Hex | rgb() as used | Usage |
|---|---|---|---|
| `bg-public` | `#F5F2EA` | 245,242,234 | Public page background |
| `bg-admin` | `#F7F5F0` | 247,245,240 | Admin page background |
| `text-primary` | `#1A1F1B` | 26,31,27 | Headings, body text |
| `text-secondary` | `#5A635D` | 90,99,93 | Meta text, labels, captions |
| `text-muted` | `#4E5751` / `#2A302C` | 78,87,81 / 42,48,44 | Lead paragraphs / article body |
| `brand-green` | `#1E4A38` | 30,74,56 | Primary buttons, links, active nav, icon accents |
| `brand-green-dark` | `#143426` | 20,52,38 | Footer bg, admin sidebar bg |
| `brand-green-mid` | `#2C5A47` | 44,90,71 | Sidebar active/hover row |
| `brand-green-tint` | `#E4ECE6` | 228,236,230 | Icon chips, avatar bg, "Active" badge bg |
| `accent-amber` | `#9A6414` | 154,100,20 | Eyebrow labels, quote-mark icon, "Pending" badge text |
| `accent-amber-tint` | `#F3E7D1` | 243,231,209 | Category tag bg, "Pending" badge bg |
| `accent-amber-text` | `#7A4E0E` | 122,78,14 | Category tag text |
| `border-default` | `#E3DDD0` | 227,221,208 | Card borders, dividers (public) |
| `border-input` | `#D6CFBF` | 214,207,191 | Form input / admin borders |
| `placeholder-media` | `#DAD4C5` | 218,212,197 | Image/photo placeholder blocks |
| `placeholder-media-text` | `#4A524D` | 74,82,77 | Text/icon on placeholder blocks |
| `video-dark` | `#2B332E` | 43,51,46 | Video thumbnail background |
| `status-neutral-bg` | `#E6E4E0` | 230,228,224 | "Suspended" badge bg |
| `status-neutral-text` | `#3E4540` | 62,69,64 | "Suspended" badge text |
| `white` | `#FFFFFF` | 255,255,255 | Cards, inputs, member-login button text |

Status badge pattern (pill, `padding: 5px 10px`, `border-radius: 999px`,
`font-size: 13px`, `font-weight: 600`):

| Status | Background | Text |
|---|---|---|
| Active | `brand-green-tint` | `brand-green` |
| Pending | `accent-amber-tint` | `accent-amber-text` |
| Suspended | `status-neutral-bg` | `status-neutral-text` |

## Typography

Two font families, loaded via `assets/css/fonts.css` as base64 `@font-face`
(self-contained, no external requests):

- **Fraunces** (serif, display) — weights 500 (normal) and 600 (semibold).
  Used for all headings, section titles, stat numbers, date-badge day
  numbers, avatar initials, and pull-quotes.
- **Instrument Sans** (sans, UI/body) — weights 400, 500, 600, 700.
  Used for everything else: nav, body copy, buttons, labels, meta text.
  Falls back to `system-ui, sans-serif`.

Scale observed in the markup (not a formal type scale — just what's used):

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
| Article body paragraph | Instrument Sans | 19px | 400 | `line-height:1.75`, `#2A302C` |
| UI text (nav, buttons, labels) | Instrument Sans | 14–16px | 500–700 | |
| Meta / caption text | Instrument Sans | 13–14px | 400–600 | `text-secondary` |

## Shape & elevation

- **Pills** (`border-radius: 999px`): buttons, nav items, category/status
  badges, date chips, tab switchers, search input... the dominant shape.
- **Cards**: `border-radius: 16–20px` (18px is the most common), white
  background, `1px solid border-default`, no box-shadow anywhere — depth
  comes from flat color contrast, not shadows.
- **Media/placeholder blocks**: `border-radius: 14–20px`, filled with
  `placeholder-media` and a centered icon + `[Bracketed label]` caption.
- **Avatars**: circular, `brand-green-tint` bg + `brand-green` initials
  (public), or `brand-green` bg + cream initials (header logo mark,
  admin user chip uses amber-tint instead).
- No shadows/blur anywhere in the design — flat, editorial, paper-like.

## Iconography

- Inline SVG only (no icon font/sprite sheet), `24x24` viewBox,
  `stroke="currentColor"`, `stroke-width="1.8"`, rounded caps/joins.
- Rendered sizes: 15–18px inline with text, 22–26px standalone, larger
  (34px) for the pull-quote mark.
- Icons inherit text color via `currentColor` — no separate icon color
  system beyond that.

## Recurring components

- **Header (public)**: logo mark (circular "11" + wordmark) — pill nav
  (active item gets `brand-green-tint` bg + `brand-green` text) —
  "Member login" pill button (dark bg, cream text).
- **Section header pattern**: eyebrow label + Fraunces H2 on the left,
  a "view all →" text link (arrow icon) on the right, used identically
  on every content section across Home/Members/Events/Gallery.
- **Event card**: white card, date badge (rounded rect, day/month split,
  `brand-green-tint` bg), category pill (amber), Fraunces H3 title,
  meta rows with icon + text, "View details →" link pinned to bottom
  via `margin-top: auto`.
- **Member card**: circular initials avatar (96px), name + discipline,
  two meta rows (role, city) with small icons, "View profile" pill
  button (outline style).
- **Blog**: one large featured card (image + tag + Fraunces H3 + byline)
  beside a list of smaller rows (thumbnail + eyebrow + title + byline).
  Article page: 820px-wide centered column, breadcrumb, H1, lead, byline
  row with share icon-buttons, then H2 sections / body / pull-quotes.
- **Gallery**: pill tab switcher ("Photo albums" / "Videos") + an
  "Upload photos" primary button; album cards (image + title + count);
  video cards (dark thumbnail, circular play button, duration badge).
- **Stats bar**: full-bleed `brand-green` background band, 4-column grid
  of Fraunces numbers over small caption labels in a lighter green tint.
- **Forms** (search/filter bars, sign-in, admin tables): white/transparent
  inputs, `border-input` 1px border, `12px` radius (`10px` in admin),
  `48px` tall (`44px` in admin), label above input in `13px semibold
  text-secondary`.
- **Footer**: full-bleed `brand-green-dark`, 4-column link grid over a
  bottom bar divider, all text in cream/tint greens.
- **Admin shell**: `brand-green-dark` sidebar (264px) with icon+label
  nav rows (active = `brand-green-mid` bg), a user chip pinned to the
  bottom; main column has a topbar (search input + icon buttons +
  primary "Create new" button) then stat-tile grids and list panels.

## Mobile responsive layer

Added in `assets/css/responsive.css`, active at `max-width: 860px`. Because
every page is inline-styled with no classes (see above), the approach is
different from a normal CSS build:

- **Attribute substring selectors carry almost all of it.** Rules like
  `[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }`
  or `[style*="padding: 96px 80px;"] { padding: 56px 20px !important; }`
  match elements by the literal inline `style="..."` text and override it
  with `!important` (required — inline styles otherwise always win the
  cascade). This single file collapses every grid to one column, scales
  the eleven headline `font-size`s down, shrinks the eight `80px`/`40px`
  gutter paddings, and turns seven different fixed-pixel `width`s (the
  820px article column, 220px filter selects, the 380px admin search box,
  etc.) fluid — all without touching the HTML.
- **A handful of elements DO carry real classes**, added by a one-time
  post-processing pass (not part of the original export) because a
  working nav/sidebar toggle can't be built from attribute selectors
  alone: `.page-root` (the 1440px canvas → fluid), `.site-header` /
  `.site-nav` / `.login-btn` (public pages), and `.admin-shell` /
  `.admin-sidebar` / `.admin-main` (admin pages).
- **Nav and sidebar collapse are pure CSS** — a hidden
  `<input type="checkbox">` plus one or more `<label for="...">` toggles,
  no JavaScript. Public header: unchecked shows logo + hamburger only;
  checked reveals the pill nav and "Member login" button stacked full-width
  below it (`.nav-toggle-input:checked ~ .site-nav`). Admin: the same
  pattern drives an off-canvas drawer — `.admin-sidebar` becomes
  `position: fixed` and slides in via `transform: translateX()`, with a
  `<label>` overlay (also wired to the checkbox) to tap-outside-to-close.
  The visible hamburger `<label>` lives inside the admin topbar (in normal
  flow) even though the checkbox it controls lives elsewhere in the DOM —
  `<label for>` doesn't require sibling adjacency, only the CSS `~`
  visibility rule does.
- **Known-fragile spots**: the substring selectors match on exact literal
  values (e.g. `"padding: 96px 80px;"` — note the trailing `;`, added
  specifically so it can't also match the longer `"...96px 80px 0px;"`
  string). Changing an inline pixel value in the HTML without a matching
  update in `responsive.css` will silently drop that element out of the
  mobile treatment. The admin table (`admin/members.html`) is wrapped in a
  `.table-scroll` div so it scrolls horizontally instead of crushing
  columns, and bare `<input>`/`<textarea>`/`<select>` get `max-width:100%`
  since a couple (e.g. the borderless post-title field) have no explicit
  width to override.

## Advertisement feature (Sponsors + Business Directory)

Two related but distinct additions, sharing all existing components —
no new visual language was introduced.

**Sponsors** — committee-curated, no public submission:
- Home page: a "Supported by our sponsors" strip (eyebrow + H2 + a
  `repeat(5, minmax(0px, 1fr))` grid of logo-placeholder tiles, same
  `placeholder-media` block style used everywhere else) placed just
  before the footer.
- Events page: the featured event card shows a small "Sponsored by
  [logo] [name]" credit line above its CTA buttons.
- `admin/sponsors.html`: a table (Sponsor, Tier, Website, Status) using
  the same white-card + table pattern as `admin/members.html`. Tier is a
  4-color badge (Diamond/Gold/Silver/Bronze) parallel to, but distinct
  from, the Active/Pending/Suspended status badge system.
- **Diamond tier**: a single exclusive top tier above Gold, currently
  held by Gollamari Coffee Roasters. Badge color is a cool icy-blue
  (`background: rgb(224, 236, 250)`, `color: rgb(30, 74, 140)`) to read
  as more premium than the warm Gold/Silver/Bronze palette. Exclusivity
  ("only one Diamond sponsor") is a content convention, not an enforced
  rule — this is a static mockup with no validation logic anywhere.
- **Diamond welcome popup** (`assets/css/diamond-popup.css`, linked only
  from `index.html`): the Diamond sponsor gets a modal on Home. The
  show/hide mechanism is CSS-only — same hidden-checkbox-plus-`<label>`
  technique as the mobile nav/sidebar toggles in `responsive.css`, but
  inverted: the checkbox starts unchecked so the overlay is visible by
  default, and checking it (via the ✕ button or a click on the backdrop,
  both `<label for="diamondPopupClose">`) hides it. A `@keyframes`
  fade+scale-in animation plays automatically on load since CSS
  animations don't need JS to start.
- **Once-per-visit memory**: this is the one deliberate exception to
  "no JavaScript" anywhere on the site (see `README.md`). A ~10-line
  inline `<script>` sits between the checkbox and the overlay markup in
  `index.html`: on load it checks `sessionStorage.getItem("diamondSponsorSeen")`
  and pre-checks the checkbox if it's set (so the popup never even
  flashes on repeat visits — the script runs and blocks rendering of the
  overlay markup that follows it, since it has no `async`/`defer`), and
  a `change` listener on the checkbox sets that flag the moment the
  popup is dismissed. `sessionStorage` means "once per browser tab
  session" — a new tab or a closed-and-reopened browser sees it again;
  it does not persist like a cookie would.
- Sponsors do **not** get a public nav item — they're supporting content,
  not something users browse to directly.

**Business Directory** — alumni self-listed, admin-approved:
- `business.html`: identical structure to `members.html` (eyebrow/H1/
  subcopy → filter bar → 4-col card grid → pagination), plus one addition:
  a dark-green CTA banner ("Own a business? List it here.") above the
  filter bar, linking to sign-in since only members can submit. Business
  cards reuse the member-card shape exactly (circular initials avatar,
  two meta rows with icons) with a category tag (the same amber pill used
  for event/blog categories) swapped in for the member's profession line.
- `business-detail.html`: identical structure to `blog-post.html` (820px
  centered column, breadcrumb, H1, byline row with action buttons, full-
  bleed 1120px cover image, body copy, pull-quote, "More ___" section at
  the bottom) — a testimonial blockquote stands in for the pull-quote, and
  a bordered contact-info card (phone/email/location rows) replaces the
  tag row as the section before "More businesses."
- `admin/businesses.html`: same filter-bar + table + pagination pattern as
  `admin/members.html`, with Category replacing Discipline and a Rejected
  status reusing the "Suspended" gray badge styling.
- Dashboard gets a 5th stat tile ("Business listings" — the stat grid is
  `repeat(5, ...)` here instead of the `repeat(4, ...)` used everywhere
  else) and a new "Business submissions" panel, both direct copies of the
  existing Members stat tile and "Membership requests" approval-row
  pattern (avatar + name/category + reject ✕ / approve ✓ buttons).
- "Business" was added as a 6th public nav item (after Gallery & Videos)
  and to the footer's Explore column, on every public page. "Businesses"
  and "Sponsors" were added to the admin sidebar (after Members), on
  every admin page. All of this inherits the responsive layer for free —
  new pages reuse the same inline-style patterns the CSS already targets,
  so no changes were needed in `responsive.css` itself.

## What's explicitly NOT implemented

- No client-side behavior beyond the mobile nav/sidebar toggles above —
  search fields, dropdowns, tabs, and forms are still visual only (see
  `README.md`).
- No design tokens file / CSS custom properties — colors and spacing
  are hard-coded inline per element. Introducing CSS variables for the
  palette above would be a reasonable next refactor, and would let the
  responsive layer above use real classes instead of substring selectors.
