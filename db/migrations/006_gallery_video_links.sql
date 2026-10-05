-- Videos can optionally belong to an event and/or a discipline.
-- Deleting the event/discipline keeps the video, just unlinks it.
alter table gallery_videos
  add column event_id      uuid references events (id) on delete set null,
  add column discipline_id uuid references disciplines (id) on delete set null;

create index gallery_videos_event_idx on gallery_videos (event_id);
create index gallery_videos_discipline_idx on gallery_videos (discipline_id);
