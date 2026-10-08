-- Sample events.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- No dependencies (created_by is NULL). Dates are fixed: the Grand Reunion is 2026-12-12 and
-- the rest are in 2027, so once those dates pass the home page and /events fall back to their
-- "nothing upcoming" states. The reunion text elsewhere uses [AMOUNT]/[DEADLINE] markers that
-- /admin/settings fills in.

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
