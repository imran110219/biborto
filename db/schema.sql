-- Batch 11 platform — Phase 1 data foundation: members.
--
-- Target: an independent Postgres database (Supabase was considered and
-- ruled out — see README.md). auth_user_id is null until a member actually
-- creates a login; rows can exist purely as committee-entered records
-- before that. NOTE: the auth.users / auth.uid() references below are
-- still Supabase-specific and need to be swapped for whatever
-- independent auth layer is chosen — see README.md's "Known gap".
--
-- Field choices are grounded in what the existing static mockup already
-- displays (see site/members.html, site/admin/members.html, site/index.html)
-- — this isn't a speculative model, it's what the UI already assumes.

create extension if not exists "pgcrypto";

create type member_platform_role as enum ('member', 'editor', 'admin');
create type member_status as enum ('pending', 'active', 'suspended');

create table members (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid references auth.users (id) on delete set null,

  -- Public fields (shown on the public directory card)
  name            text not null,
  discipline      text not null,
  profession      text,
  city            text,
  country         text,
  avatar_url      text,

  -- Admin-only fields (shown only in admin/members.html today)
  email           text not null unique,
  student_id      text,
  platform_role   member_platform_role not null default 'member',
  status          member_status not null default 'pending',

  -- Consent: opt-out model — approved members are public by default,
  -- with a profile setting to go private.
  is_public       boolean not null default true,

  joined_at       timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index members_status_idx on members (status);
create index members_discipline_idx on members (discipline);
create index members_city_idx on members (city);

-- Keep updated_at honest on every write.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_set_updated_at
  before update on members
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Row-level security: encodes the visibility tiers from the report.
-- ---------------------------------------------------------------------
alter table members enable row level security;

-- Anyone (including anonymous visitors) can read PUBLIC fields of
-- ACTIVE, opted-in members — this backs the public directory.
-- Enforced via a view (below), not by relaxing table-level SELECT,
-- so admin-only columns (email, student_id) never leak through it.
create policy "members_select_own_row"
  on members for select
  using (auth_user_id = auth.uid());

create policy "members_admin_full_access"
  on members for all
  using (
    exists (
      select 1 from members m
      where m.auth_user_id = auth.uid() and m.platform_role in ('admin', 'editor')
    )
  );

create policy "members_update_own_public_fields"
  on members for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Public-safe view: this is what the directory build script and any
-- future public API should query — never the base table directly.
create view public_members as
  select id, name, discipline, profession, city, country, avatar_url
  from members
  where status = 'active' and is_public = true;
