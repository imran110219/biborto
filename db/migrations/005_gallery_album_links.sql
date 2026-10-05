-- Albums can optionally belong to an event and/or a discipline.
-- Deleting the event/discipline keeps the album, just unlinks it.
alter table gallery_albums
  add column event_id      uuid references events (id) on delete set null,
  add column discipline_id uuid references disciplines (id) on delete set null;

create index gallery_albums_event_idx on gallery_albums (event_id);
create index gallery_albums_discipline_idx on gallery_albums (discipline_id);
