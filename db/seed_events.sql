-- Migrates the 4 sample events from web/lib/mock-data.ts into real rows.
-- No FK dependency — created_by is left NULL (mock data doesn't name an
-- organizer per event).
--
-- Known gap: mock data only gives month + day (e.g. "DEC" / "12"), never
-- a year — event_date below fills in a year by inference, not because
-- it's present in the source:
--   - Dec 12 (Grand Reunion) -> 2026, the nearest upcoming Dec 12 from
--     the site's current in-story date (Sep 2026) and consistent with
--     the blog post describing it as imminent ("Register before
--     [DEADLINE]").
--   - Jan 18 / Mar 02 / Mar 20 -> 2027, since they're listed after the
--     Dec 12 reunion as the following events on the calendar.
-- Confirm/correct these with the events committee before relying on
-- them for real scheduling.

insert into events
  (slug, title, event_date, start_time, end_time, location, category, description, featured)
values
  ('batch-11-grand-reunion', 'Batch 11 Grand Reunion', '2026-12-12', '10:00', '20:00',
   'Khulna University campus', 'Reunion',
   'A full day back on campus: a morning walk through the departments, lunch together, a photo session at the central field and a cultural evening. Families are welcome.',
   true),

  ('career-talk-batchmates-in-tech', 'Career talk: Batchmates in tech', '2027-01-18', '20:30', null,
   'Online · Zoom', 'Online', null, false),

  ('iftar-get-together-dhaka-chapter', 'Iftar get-together, Dhaka chapter', '2027-03-02', '17:30', null,
   'Dhanmondi, Dhaka', 'Chapter', null, false),

  ('tree-planting-at-gollamari', 'Tree planting at Gollamari', '2027-03-20', '09:00', null,
   'Khulna University campus', 'Volunteer', null, false);
