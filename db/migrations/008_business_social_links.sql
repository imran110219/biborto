-- Optional social profile links for business listings (same shape as
-- members.linkedin_url / facebook_url). Stored as entered/normalized
-- http(s) URLs; new columns are appended to public_businesses so
-- CREATE OR REPLACE VIEW accepts it.
alter table businesses
  add column linkedin_url text,
  add column facebook_url text;

create or replace view public_businesses as
  select id, slug, name, category, city, tagline, description, offerings,
         testimonial, phone, email, website, cover_photo_key, logo_key,
         submitted_at, linkedin_url, facebook_url
  from businesses
  where status = 'active';
