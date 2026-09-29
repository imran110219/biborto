-- Migrates the 12 sample members already hardcoded across
-- site/members.html, site/admin/members.html, and site/index.html into
-- real rows, so the mockup data becomes the first real dataset instead
-- of being thrown away.
--
-- Depends on seed_disciplines.sql having run first. discipline_id is
-- resolved by KU's official discipline code, not by name — the mockup's
-- discipline strings turned out to differ slightly from the real KU
-- names for 3 of these 12 ("Urban & Rural Planning" vs "Urban and Rural
-- Planning", "Electronics & Communication Eng." vs "Electronics and
-- Communication Engineering", "Fisheries & Marine Resource Tech." vs
-- "...Technology") — using the authoritative code sidesteps the mismatch
-- entirely rather than requiring name string cleanup here.
--
-- platform_role: the mockup's roles were member/editor/admin; the
-- current enum is member/admin/superadmin instead. Remapped rather than
-- left as-is: Tahmina Akter (the sole 'admin') -> 'superadmin' (top-level
-- control); Rafiul Islam and Arif Khan (the 2 'editor's) -> 'admin'
-- (kept their elevated access, just under the new tier name).
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
  (slug, name, discipline_id, profession, city, email, platform_role, status, joined_at, is_public)
values
  ('tahmina-akter',   'Tahmina Akter',  (select id from disciplines where code = '01'), 'Architect',             'Dhaka',      'tahmina@example.com',  'superadmin', 'active', '2025-01-15', true),
  ('rafiul-islam',    'Rafiul Islam',   (select id from disciplines where code = '02'), 'Software engineer',     'Berlin',     'rafiul@example.com',   'admin', 'active',      '2025-02-10', true),
  ('nusrat-jahan',    'Nusrat Jahan',   (select id from disciplines where code = '11'), 'Research scientist',    'Khulna',     'nusrat@example.com',   'member', 'active',    '2025-02-20', true),
  ('mahmudul-hasan',  'Mahmudul Hasan', (select id from disciplines where code = '03'), 'Branch manager',        'Chattogram', 'mahmudul@example.com','member', 'active',    '2025-03-05', true),
  ('sabrina-rahman',  'Sabrina Rahman', (select id from disciplines where code = '04'), 'Urban planner',         'Dhaka',      'sabrina@example.com', 'member', 'pending',   '2026-09-01', true),
  ('arif-khan',       'Arif Khan',      (select id from disciplines where code = '05'), 'Forest officer',        'Bagerhat',   'arif@example.com',    'admin', 'active',      '2025-04-12', true),
  ('farzana-sultana', 'Farzana Sultana',(select id from disciplines where code = '14'), 'Lecturer',              'Jashore',    'farzana@example.com', 'member', 'active',    '2025-01-01', true),
  ('imran-hossain',   'Imran Hossain',  (select id from disciplines where code = '09'), 'Network engineer',      'Dubai',      'imran@example.com',   'member', 'pending',   '2026-09-01', true),
  ('lamia-noor',      'Lamia Noor',     (select id from disciplines where code = '10'), 'Climate analyst',       'Toronto',    'lamia@example.com',   'member', 'suspended', '2025-06-18', true),
  ('shafiqul-mamun',  'Shafiqul Mamun', (select id from disciplines where code = '15'), 'Policy researcher',     'Dhaka',      'shafiqul@example.com','member', 'active',    '2025-01-01', true),
  ('rumana-begum',    'Rumana Begum',   (select id from disciplines where code = '06'), 'Aquaculture consultant','Satkhira',   'rumana@example.com',  'member', 'active',    '2025-01-01', true),
  ('tanvir-hasan',    'Tanvir Hasan',   (select id from disciplines where code = '12'), 'Data scientist',        'Sydney',     'tanvir@example.com',  'member', 'active',    '2025-01-01', true);
