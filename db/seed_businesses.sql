-- Migrates the 8 sample businesses from web/lib/mock-data.ts into real
-- rows. Depends on seed_members.sql having run first — owner_member_id
-- is resolved by matching `ownerName` against the members already
-- seeded (all 8 owners match an existing member by name).
--
-- Known gaps carried over from the mockup (not invented here):
--   - phone, email, website, cover_photo_key, logo_key: the business
--     detail page (web/app/business/[slug]/page.tsx) fakes a phone
--     number and an email address at render time (e.g.
--     `${slug}@example.com`) — those were never real data, so they're
--     left NULL here rather than baked in as if they were real contact
--     info.
--   - submitted_at: mock data only gives "Mon YYYY" (e.g. "Jan 2026").
--     Defaulted to the 1st of that month.
--   - testimonial: empty-string placeholders in the mock (6 of 8
--     listings) are stored as NULL, not as empty strings.

insert into businesses
  (slug, owner_member_id, name, category, city, status, tagline, description, offerings, testimonial, submitted_at)
values
  ('batchworks-catering', (select id from members where name = 'Tahmina Akter'),
   'BatchWorks Catering', 'Food & Catering', 'Dhaka', 'active',
   'Home-style Bengali catering for reunions, office lunches and family events — run by a batchmate, trusted by the batch.',
   'BatchWorks Catering started out of a batchmate''s home kitchen in Dhaka. We now cater office lunches, family gatherings, and — every December — the Batch 11 Grand Reunion itself. Every order is prepared fresh, with menus that can flex for vegetarian, halal, and allergy needs.',
   array['Event catering', 'Office lunch plans', 'Home delivery', 'Custom menus'],
   'Booked BatchWorks for our department reunion — tasted like home. Highly recommend to any batchmate planning an event.',
   '2026-01-01'),

  ('islam-software-consulting', (select id from members where name = 'Rafiul Islam'),
   'Islam Software Consulting', 'Tech Services', 'Berlin', 'active',
   'Software consulting for small teams.', 'Software consulting for small teams.',
   '{}', null, '2026-02-01'),

  ('gollamari-coffee-roasters', (select id from members where name = 'Arif Khan'),
   'Gollamari Coffee Roasters', 'Food & Catering', 'Bagerhat', 'active',
   'Small-batch coffee roasted in Bagerhat.', 'Small-batch coffee roasted in Bagerhat.',
   '{}', null, '2026-03-01'),

  ('rahman-urban-planning-studio', (select id from members where name = 'Sabrina Rahman'),
   'Rahman Urban Planning Studio', 'Consulting', 'Dhaka', 'pending',
   'Urban planning consultancy.', 'Urban planning consultancy.',
   '{}', null, '2026-09-01'),

  ('sultana-language-academy', (select id from members where name = 'Farzana Sultana'),
   'Sultana Language Academy', 'Education', 'Jashore', 'active',
   'English language coaching.', 'English language coaching.',
   '{}', null, '2026-04-01'),

  ('hossain-network-solutions', (select id from members where name = 'Imran Hossain'),
   'Hossain Network Solutions', 'Tech Services', 'Dubai', 'pending',
   'Network infrastructure consulting.', 'Network infrastructure consulting.',
   '{}', null, '2026-09-01'),

  ('begum-aquaculture-exports', (select id from members where name = 'Rumana Begum'),
   'Begum Aquaculture Exports', 'Retail & Trade', 'Satkhira', 'active',
   'Aquaculture exports.', 'Aquaculture exports.',
   '{}', null, '2026-05-01'),

  ('sundarban-eco-tours', (select id from members where name = 'Lamia Noor'),
   'Sundarban Eco Tours', 'Travel & Tourism', 'Toronto', 'rejected',
   'Guided Sundarbans eco tours.', 'Guided Sundarbans eco tours.',
   '{}', null, '2026-06-01');
