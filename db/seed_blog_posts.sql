-- Sample blog posts.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- Depends on seed_members.sql: author_member_id is resolved by matching the author's name
-- where it names a member; "Reunion committee" isn't a person, so that post sets author_name
-- instead. All four are published and public, dated 2026. Only "planning-the-grand-reunion" has
-- real article text (with [AMOUNT]/[DEADLINE] markers that /admin/settings fills in); the other
-- three carry the site's "coming soon" body.

insert into blog_posts
  (slug, category, title, author_member_id, author_name, body, tags, status, is_public, featured, published_at)
values
  ('planning-the-grand-reunion', 'Reunion', 'Planning the grand reunion: what we need from you',
   null, 'Reunion committee',
   $body$We are bringing Batch 11 back to campus. Here is how the day will work, and the three things the committee needs from every batchmate.

The grand reunion is set for Saturday, December 12, on the Khulna University campus. It will be the first time many of us walk through Gollamari together since our final exams, and we want every batchmate who can make it to be there.

## 1. Register before [DEADLINE]

Sign in to the member panel and press RSVP on the event page. Tell us whether you are bringing family, so the committee can plan food and seating. The registration fee is [AMOUNT] per person.

> The day belongs to everyone who shared these classrooms. Come as you are.

## 2. Send us your old photos

We are building a slideshow for the cultural evening. Upload campus-era photos to the Gallery from your member account, or share them with your department representative.

## 3. Volunteer for a team

We need hands for registration, decoration, photography and the evening program. Reply in the member panel with the team you would like to join.$body$,
   array['Reunion', 'Announcements', 'Volunteering'], 'published', true, true, '2026-09-24'),

  ('sundarbans-field-trip', 'Memories', 'Our first-year field trip to the Sundarbans',
   (select id from members where name = 'Arif Khan'), null,
   'Full story coming soon — this teaser links to a real article slug so the page structure is ready once the content team writes it up.',
   '{}', 'published', true, false, '2026-09-10'),

  ('starting-over-abroad', 'Careers', 'Starting over abroad: notes from Toronto',
   (select id from members where name = 'Lamia Noor'), null,
   'Full story coming soon — this teaser links to a real article slug so the page structure is ready once the content team writes it up.',
   '{}', 'published', true, false, '2026-08-28'),

  ('gollamari-since-we-left', 'Campus', 'What has changed at Gollamari since we left',
   (select id from members where name = 'Nusrat Jahan'), null,
   'Full story coming soon — this teaser links to a real article slug so the page structure is ready once the content team writes it up.',
   '{}', 'published', true, false, '2026-08-15');
