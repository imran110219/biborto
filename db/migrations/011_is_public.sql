-- One shared visibility flag for the public-facing content types:
-- blog posts, events, gallery albums and gallery videos. `is_public = true`
-- means the item is available on the public site (landing page, list pages
-- and its own page); false hides it from everyone but admins. Existing rows
-- stay public (default true).
--
-- blog_posts already had a `visibility` enum (public | members_only). It is
-- replaced by is_public: public -> true, members_only -> false. Blog keeps its
-- separate draft/published `status`.
alter table events         add column is_public boolean not null default true;
alter table gallery_albums add column is_public boolean not null default true;
alter table gallery_videos add column is_public boolean not null default true;
alter table blog_posts     add column is_public boolean not null default true;

update blog_posts set is_public = (visibility = 'public');

drop view public_blog_posts;
alter table blog_posts drop column visibility;
drop type blog_visibility;

create view public_blog_posts as
  select id, slug, category, title, author_member_id, author_name, body, cover_photo_key,
         tags, featured, published_at
  from blog_posts
  where status = 'published' and is_public;
