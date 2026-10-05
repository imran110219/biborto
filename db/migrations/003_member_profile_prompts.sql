-- Optional profile prompts for members.
alter table members
  add column short_bio text,
  add column favorite_campus_place text,
  add column most_memorable_event text;

create or replace view public_members as
  select id, slug, name, discipline_id, profession, current_employer,
         bio, city, country_id, avatar_key, linkedin_url, facebook_url,
         website_url, campus_name, short_bio, favorite_campus_place,
         most_memorable_event
  from members
  where status = 'active' and is_public = true;
