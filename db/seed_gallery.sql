-- Sample gallery albums and videos.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- No gallery_photos rows: photos are uploaded to R2 through the admin gallery, and an album's
-- photo count is count(*) over gallery_photos, so it reads 0 until then. gallery_videos.youtube_url
-- is NULL until a real link is entered. No dependencies (created_by / added_by are NULL).

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
