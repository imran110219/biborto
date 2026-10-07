-- Two profile URLs per member: the roll (student_id) and the name slug.
--   /members/arch-110101       -> discipline short code + members.student_id (now unique),
--                                 resolved at request time, not stored
--   /members/md-zahidur-rahman -> members.slug, rebuilt below from the name
-- (lowercase, hyphen-separated, "-2", "-3"… only when two names collide).
--
-- WARNING: this rewrites every members.slug, so any previously shared
-- /members/<old-slug> link stops working. Run it once, before the site is
-- linked from elsewhere.

-- 1. Roll is unique per member (confirmed). Fails if duplicates exist — fix those first.
create unique index members_student_id_key on members (student_id) where student_id is not null;

-- 2. Rebuild the name slugs. Two steps because a unique column can't be rewritten in
--    place while old and new values overlap.
update members set slug = id::text;

with base as (
  select id,
         coalesce(nullif(trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), ''), 'member') as s,
         student_id
    from members
), ranked as (
  select id, s, row_number() over (partition by s order by student_id nulls last, id) as n
    from base
)
update members m
   set slug = case when r.n = 1 then r.s else r.s || '-' || r.n end
  from ranked r
 where m.id = r.id;
