-- Default site settings (the committee edits them later at /admin/settings).
-- Keys match SETTING_KEYS in web/lib/settings.ts. Optional settings the committee
-- hasn't decided yet (contact email, YouTube/Facebook links, reunion fee and
-- deadline) are deliberately absent: a missing row means "not set", and the site
-- hides or words around them instead of showing a placeholder.
--
-- Idempotent (`on conflict do nothing`), so it is safe on a database that already
-- has settings: psql "$DATABASE_URL" -f db/seed_site_settings.sql
insert into site_settings (key, value) values
  ('batch_name',         'Batch 11'),
  ('institution',        'Khulna University'),
  ('motto',              'One as an individual, united as one'),
  ('theme_color',        '#1e4a38'),
  ('accent_color',       '#9a6414'),
  ('hero_description',   'The home of Khulna University Batch 11. Find batchmates, read their stories, join the next reunion, and relive campus days in photos and videos.'),
  ('footer_description', 'The official space for Khulna University Batch 11 to stay connected.')
on conflict (key) do nothing;
