-- Superadmin-managed home-page popups (custom HTML or an image/animated
-- GIF). When none is active the site falls back to the diamond sponsor popup.
create type popup_kind as enum ('html', 'image');

create table popups (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,                 -- admin-facing label only
  kind         popup_kind not null,
  html_content text,                          -- kind = 'html'; rendered in a sandboxed iframe
  image_key    text,                          -- kind = 'image'; R2 object key
  alt_text     text,
  link_url     text,                          -- optional click-through for image popups
  height_px    integer not null default 420 check (height_px between 160 and 900),
  active       boolean not null default false,
  created_by   uuid references members (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- At most one popup is active; the actions deactivate the others first.
create unique index popups_one_active_idx on popups (active) where active;

create trigger popups_set_updated_at
  before update on popups
  for each row execute function set_updated_at();
