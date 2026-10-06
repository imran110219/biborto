-- Migrates the 4 sample blog posts from web/lib/mock-data.ts into real
-- rows. Depends on seed_members.sql — author_member_id is resolved by
-- matching `author` against a member name where it names one (3 of 4);
-- "Reunion committee" isn't a person, so that post uses author_name
-- instead (author_member_id stays NULL).
--
-- Known gaps carried over from the mockup (not invented here):
--   - `body`: mock-data.ts's BlogPost type has no body field at all —
--     the article text only exists hardcoded in JSX
--     (web/app/blog/[slug]/page.tsx). Reproduced verbatim below for the
--     one post with real content ("planning-the-grand-reunion"); the
--     other 3 get the exact same "coming soon" placeholder the site
--     itself shows for them.
--   - `date`: mock data gives "Mon DD" only, no year. Assumed 2026 —
--     all 4 dates (Aug/Sep) fall before the site's current in-story date
--     (Sep 29, 2026), consistent with these being already-published
--     posts rather than future-dated ones.
--   - `status`/`is_public`: not in the mock type at all. Set to
--     'published' + public (true) for all 4 since that's what the site
--     actually renders (publicly reachable via generateStaticParams,
--     no auth gate) — the "Draft" badge on admin/edit-post is a demo of
--     the editing UI, not a claim about this post's real status.
--   - read time is intentionally not stored — see schema.sql.

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
