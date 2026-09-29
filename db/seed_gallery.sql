-- Migrates the 6 sample albums and 3 sample videos from
-- web/lib/mock-data.ts into real rows. No FK dependency — created_by /
-- added_by are left NULL (mock data doesn't name an uploader for
-- either).
--
-- Known gaps carried over from the mockup (not invented here):
--   - No gallery_photos rows: every album's mock "count" is a bracketed
--     placeholder ("[00] photos") — no actual photo was ever uploaded
--     in the mockup, so there's nothing real to seed. Photo count is
--     computed as count(*) on gallery_photos per album, so it's
--     correctly 0 until real photos are uploaded to R2.
--   - gallery_videos.youtube_url: the mock data only ever had a title,
--     never a real link (see schema.sql's comment on this column) —
--     left NULL for all 3.

insert into gallery_albums (slug, name) values
  ('orientation-day', 'Orientation day'),
  ('rag-day', 'Rag day'),
  ('sundarbans-field-trip', 'Sundarbans field trip'),
  ('convocation', 'Convocation'),
  ('sports-week', 'Sports week'),
  ('grand-reunion', 'Grand reunion');

insert into gallery_videos (title) values
  ('Rag day highlights'),
  ('Convocation day on campus'),
  ('Grand reunion — full recap');
