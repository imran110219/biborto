-- Batch 11 platform — full data model.
--
-- Target: an independent Postgres database (no Supabase). Field choices
-- are grounded in what the Next.js app already assumes — see
-- web/lib/types.ts, web/lib/mock-data.ts, and the admin pages under
-- web/app/admin/** — this isn't a speculative model, it's what the UI
-- already renders.
--
-- Auth: no Supabase Auth, so there's no auth.users / auth.uid() to sit
-- under. `users` below is a minimal placeholder for login identity
-- (Phase 2, not built yet) — expect it to grow or get replaced once an
-- actual auth approach (library or hand-rolled) is chosen.
--
-- Authorization: no row-level security. Supabase-style RLS leaned on
-- auth.uid() being available inside every query via Supabase's
-- connection-pooling + JWT integration; a plain Postgres connection from
-- a Next.js Route Handler doesn't get that for free (it would require
-- `SET LOCAL` per request to fake it). Simpler default: authorization
-- lives in the Route Handlers, same as any other Postgres-backed app.
-- Revisit if a real multi-tenant threat model shows up.
--
-- File storage: Cloudflare R2. Columns named *_key store the R2 object
-- key (not a full URL) — the app resolves keys to public/signed URLs at
-- render time, so a bucket/domain change never touches stored data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type member_platform_role as enum ('member', 'editor', 'admin');
create type member_status as enum ('pending', 'active', 'suspended');

-- Scoped to exactly the 12 disciplines in the current seed data, not the
-- full set Khulna University actually offers (it's organized into many
-- more "Discipline" units than that). Add new values as real members
-- from other disciplines join: `alter type member_discipline add value
-- 'New Discipline Name';`.
create type member_discipline as enum (
  'Architecture',
  'Computer Science & Engineering',
  'Pharmacy',
  'Business Administration',
  'Urban & Rural Planning',
  'Forestry & Wood Technology',
  'English',
  'Electronics & Communication Eng.',
  'Environmental Science',
  'Economics',
  'Fisheries & Marine Resource Tech.',
  'Mathematics'
);

create type blood_group as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

create type business_status as enum ('pending', 'active', 'rejected');
create type sponsor_tier as enum ('diamond', 'gold', 'silver', 'bronze');
create type blog_status as enum ('draft', 'published');
create type blog_visibility as enum ('public', 'members_only');
create type rsvp_status as enum ('going', 'interested', 'declined');

-- ---------------------------------------------------------------------
-- users — login identity only (Phase 2). Deliberately minimal: no
-- sessions/OAuth-account tables yet, since the actual auth approach
-- (library vs. hand-rolled, Google OAuth flow) isn't chosen. Profile
-- data lives on `members`, not here.
-- ---------------------------------------------------------------------
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text,             -- null for Google-OAuth-only accounts
  google_id     text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- members — the alumni directory / profile data.
-- ---------------------------------------------------------------------
create table members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users (id) on delete set null,

  -- Public fields (shown on the public directory card)
  name            text not null,
  discipline      member_discipline not null,
  profession      text,
  current_employer text,
  bio             text,
  city            text,
  country         text,
  avatar_key      text,
  linkedin_url    text,
  facebook_url    text,

  -- Admin-only fields (shown only in admin/members.html today)
  email           text not null unique,
  phone_number    text,
  student_id      text,
  platform_role   member_platform_role not null default 'member',
  status          member_status not null default 'pending',

  -- Not shown anywhere in the mockup yet; kept out of public_members
  -- below since it's more sensitive than the rest of the public card —
  -- surface it members-only (e.g. an emergency blood-donor search),
  -- not to anonymous visitors.
  blood_group     blood_group,

  -- Consent: opt-out model — approved members are public by default,
  -- with a profile setting to go private.
  is_public       boolean not null default true,

  joined_at       timestamptz not null default now(),
  reviewed_by     uuid references members (id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index members_status_idx on members (status);
create index members_discipline_idx on members (discipline);
create index members_city_idx on members (city);

create trigger members_set_updated_at
  before update on members
  for each row execute function set_updated_at();

-- Public-safe view: what the public directory and any public API should
-- query — never the base table directly (keeps email/student_id/
-- phone_number/blood_group out).
create view public_members as
  select id, name, discipline, profession, current_employer, bio, city,
         country, avatar_key, linkedin_url, facebook_url
  from members
  where status = 'active' and is_public = true;

-- ---------------------------------------------------------------------
-- businesses — the alumni-run Business Directory. Self-listed by a
-- member, reviewed through the same approve/reject pattern as
-- membership requests.
-- ---------------------------------------------------------------------
create table businesses (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  owner_member_id uuid references members (id) on delete set null,

  name            text not null,
  category        text not null,
  city            text,
  status          business_status not null default 'pending',

  tagline         text,
  description     text,
  offerings       text[] not null default '{}',
  testimonial     text,

  phone           text,
  email           text,
  website         text,
  cover_photo_key text,
  logo_key        text,

  submitted_at    timestamptz not null default now(),
  reviewed_by     uuid references members (id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index businesses_status_idx on businesses (status);
create index businesses_category_idx on businesses (category);
create index businesses_owner_idx on businesses (owner_member_id);

create trigger businesses_set_updated_at
  before update on businesses
  for each row execute function set_updated_at();

create view public_businesses as
  select id, slug, name, category, city, tagline, description, offerings,
         testimonial, phone, email, website, cover_photo_key, logo_key,
         submitted_at
  from businesses
  where status = 'active';

-- ---------------------------------------------------------------------
-- sponsors — committee-curated, no public submission flow. Distinct
-- from businesses: a sponsor is *often* also a batchmate's business
-- (5 of the current 5 sponsors are), but sponsorship is entered and
-- managed independently, so business_id is an optional cross-link, not
-- a foreign key businesses depend on.
-- ---------------------------------------------------------------------
create table sponsors (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses (id) on delete set null,

  name        text not null,
  tier        sponsor_tier not null,
  website     text,
  logo_key    text,             -- null until a real logo is uploaded to R2
  active      boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index sponsors_tier_idx on sponsors (tier);

create trigger sponsors_set_updated_at
  before update on sponsors
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- events + RSVPs
-- ---------------------------------------------------------------------
create table events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  event_date      date not null,
  start_time      time,
  end_time        time,
  location        text,
  category        text,
  description     text,
  featured        boolean not null default false,
  cover_photo_key text,

  created_by      uuid references members (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index events_event_date_idx on events (event_date);

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

create table event_rsvps (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events (id) on delete cascade,
  member_id        uuid not null references members (id) on delete cascade,
  status           rsvp_status not null default 'going',
  bringing_family  boolean not null default false,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (event_id, member_id)
);

create index event_rsvps_event_idx on event_rsvps (event_id);
create index event_rsvps_member_idx on event_rsvps (member_id);

create trigger event_rsvps_set_updated_at
  before update on event_rsvps
  for each row execute function set_updated_at();

-- "[00] going of [000] invited" on the admin dashboard: "going" is
-- count(event_rsvps where status='going'); "invited" isn't modeled yet
-- (no per-event audience targeting) — treat it as "all active members"
-- until a real invite-list feature is needed.

-- ---------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------
create table blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  category          text not null,
  title             text not null,
  author_member_id  uuid references members (id) on delete set null,

  body              text not null default '',
  cover_photo_key   text,
  tags              text[] not null default '{}',

  status            blog_status not null default 'draft',
  visibility        blog_visibility not null default 'public',
  featured          boolean not null default false,
  published_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index blog_posts_status_idx on blog_posts (status);
create index blog_posts_category_idx on blog_posts (category);
create index blog_posts_published_at_idx on blog_posts (published_at desc);

create trigger blog_posts_set_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

-- read_time is intentionally not stored — derive it from body length at
-- render time so it can't drift from the actual content.

create view public_blog_posts as
  select id, slug, category, title, author_member_id, body, cover_photo_key,
         tags, featured, published_at
  from blog_posts
  where status = 'published' and visibility = 'public';

-- ---------------------------------------------------------------------
-- gallery — albums of photos, plus a separate videos list (YouTube
-- embeds, not R2-hosted).
-- ---------------------------------------------------------------------
create table gallery_albums (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references members (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger gallery_albums_set_updated_at
  before update on gallery_albums
  for each row execute function set_updated_at();

create table gallery_photos (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid not null references gallery_albums (id) on delete cascade,
  r2_key       text not null,
  caption      text,
  uploaded_by  uuid references members (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index gallery_photos_album_idx on gallery_photos (album_id);

create table gallery_videos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  youtube_url  text,             -- null until the real YouTube link is filled in
  added_by     uuid references members (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- activity_log — backs the admin dashboard's "Recent activity" panel.
-- summary is a precomputed human-readable string (not reconstructed
-- from target_type/target_id at read time) so entries stay meaningful
-- even after the target row is edited or deleted.
-- ---------------------------------------------------------------------
create table activity_log (
  id               uuid primary key default gen_random_uuid(),
  actor_member_id  uuid references members (id) on delete set null,
  action           text not null,       -- e.g. 'blog_post.submitted'
  target_type      text not null,       -- e.g. 'blog_post'
  target_id        uuid,
  summary          text not null,       -- e.g. 'Arif Khan submitted a blog post for review'
  created_at       timestamptz not null default now()
);

create index activity_log_created_at_idx on activity_log (created_at desc);
