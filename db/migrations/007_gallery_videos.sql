-- Create the gallery video table for databases that were initialized
-- before gallery videos were added to the full schema. Keep this
-- idempotent so it can also repair a partially applied gallery setup.
create table if not exists gallery_videos (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  youtube_url    text,
  event_id       uuid references events (id) on delete set null,
  discipline_id  uuid references disciplines (id) on delete set null,
  added_by       uuid references members (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index if not exists gallery_videos_event_idx
  on gallery_videos (event_id);
create index if not exists gallery_videos_discipline_idx
  on gallery_videos (discipline_id);
