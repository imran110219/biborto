-- Sample gallery album and video.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- One album and one video, both "First Batch Meetup" and linked to the sample event of that name, so
-- this runs after seed_events.sql. No gallery_photos rows: photos are uploaded to R2 through the admin
-- gallery, and an album's photo count is count(*) over gallery_photos, so it reads 0 until then.
-- gallery_videos.youtube_url is NULL until a real link is entered.

insert into gallery_albums (slug, name, event_id) values
  ('first-batch-meetup', 'First Batch Meetup', (select id from events where slug = 'first-batch-meetup'));

insert into gallery_videos (title, event_id) values
  ('First Batch Meetup — highlights', (select id from events where slug = 'first-batch-meetup'));
