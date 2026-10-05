-- Optional campus name for each member's academic profile.
alter table members add column campus_name text;

create or replace view public_members as
  select id, slug, name, discipline_id, profession, current_employer, bio, city,
         country_id, avatar_key, linkedin_url, facebook_url, website_url, campus_name
  from members
  where status = 'active' and is_public = true;
