-- Sample business-directory listings.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- Depends on seed_members.sql: owner_member_id is resolved by matching the owner's name
-- against the seeded roster. Contact fields (phone, email, website, images) are left NULL
-- on purpose — nothing here pretends to be real contact info. submitted_at is the 1st of the
-- month the listing is set in.

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
