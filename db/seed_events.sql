-- Sample event.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- One event, "First Batch Meetup". No dependencies (created_by is NULL). The date is fixed
-- (2026-12-12), so once it passes, the home page and /events fall back
-- to their "nothing upcoming" states (the event then appears under "Past events").

insert into events
  (slug, title, event_date, start_time, end_time, location, category, description, featured)
values
  ('first-batch-meetup', 'First Batch Meetup', '2026-12-12', '10:00', '20:00',
   'Khulna University campus', 'Reunion',
   'The first get-together of the whole batch: a morning walk through the departments, lunch together, a photo session at the central field and a cultural evening. Families are welcome.',
   true);
