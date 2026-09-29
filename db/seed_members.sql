-- Migrates the 12 sample members already hardcoded across
-- site/members.html, site/admin/members.html, and site/index.html into
-- real rows, so the mockup data becomes the first real dataset instead
-- of being thrown away.
--
-- Known gaps carried over from the mockup (not invented here, flagged
-- honestly rather than backfilled with fake data):
--   - student_id: the UI only ever showed a bracketed "[ID]" placeholder,
--     never a real value, for every member. Left NULL — needs a real
--     collection step (e.g. an admin bulk-edit pass) before it's useful.
--   - country: implied by the homepage stat ("Countries we live in") but
--     never actually captured anywhere. Left NULL for the same reason.
--   - 4 of these 12 (Farzana, Shafiqul, Rumana, Tanvir) only ever
--     appeared in the PUBLIC directory, never in the admin table — so
--     they have no source for email/role/joined_at. Defaulted to
--     status='active' (since they were already shown as approved,
--     verified batchmates) with a placeholder @example.com email
--     matching the convention the other 8 already used, and joined_at
--     defaulted to 2025-01-01. These four rows need a real email on
--     file before any auth/login work lands.

insert into members
  (name, discipline, profession, city, email, platform_role, status, joined_at, is_public)
values
  ('Tahmina Akter',  'Architecture',                       'Architect',             'Dhaka',      'tahmina@example.com',  'admin',  'active',    '2025-01-15', true),
  ('Rafiul Islam',   'Computer Science & Engineering',      'Software engineer',     'Berlin',     'rafiul@example.com',   'editor', 'active',    '2025-02-10', true),
  ('Nusrat Jahan',   'Pharmacy',                            'Research scientist',    'Khulna',     'nusrat@example.com',   'member', 'active',    '2025-02-20', true),
  ('Mahmudul Hasan', 'Business Administration',             'Branch manager',        'Chattogram', 'mahmudul@example.com','member', 'active',    '2025-03-05', true),
  ('Sabrina Rahman', 'Urban & Rural Planning',               'Urban planner',         'Dhaka',      'sabrina@example.com', 'member', 'pending',   '2026-09-01', true),
  ('Arif Khan',      'Forestry & Wood Technology',           'Forest officer',        'Bagerhat',   'arif@example.com',    'editor', 'active',    '2025-04-12', true),
  ('Farzana Sultana','English',                              'Lecturer',              'Jashore',    'farzana@example.com', 'member', 'active',    '2025-01-01', true),
  ('Imran Hossain',  'Electronics & Communication Eng.',     'Network engineer',      'Dubai',      'imran@example.com',   'member', 'pending',   '2026-09-01', true),
  ('Lamia Noor',     'Environmental Science',                'Climate analyst',       'Toronto',    'lamia@example.com',   'member', 'suspended', '2025-06-18', true),
  ('Shafiqul Mamun', 'Economics',                            'Policy researcher',     'Dhaka',      'shafiqul@example.com','member', 'active',    '2025-01-01', true),
  ('Rumana Begum',   'Fisheries & Marine Resource Tech.',    'Aquaculture consultant','Satkhira',   'rumana@example.com',  'member', 'active',    '2025-01-01', true),
  ('Tanvir Hasan',   'Mathematics',                          'Data scientist',        'Sydney',     'tanvir@example.com',  'member', 'active',    '2025-01-01', true);
