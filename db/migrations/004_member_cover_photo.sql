-- Cover images share the existing R2 member photo upload flow.
alter table members add column cover_photo_key text;

create or replace view public_members as
  select id, slug, name, discipline_id, profession, current_employer, bio,
         city, country_id, avatar_key, linkedin_url, facebook_url, website_url,
         campus_name, short_bio, favorite_campus_place, most_memorable_event,
         cover_photo_key
  from members
  where status = 'active' and is_public = true;
