-- Bootstrap the platform's initial superadmin identity.
--
-- Creates the active, non-public member record. The email comes from the psql variable
-- `superadmin_email`, which seed.sh sets from SUPERADMIN_EMAIL (default superadmin@biborto11.com);
-- run this file by hand with: psql -v superadmin_email=you@example.org -f db/seed_superadmin.sql
-- seed.sh follows this with
-- web/scripts/seed-superadmin-login.mjs, which creates the password login from the
-- SUPERADMIN_PASSWORD environment variable (stored as a bcrypt hash).
insert into members
  (slug, name, email, platform_role, status, joined_at, is_public, profile_completed_at)
values
  ('biborto-superadmin', 'Biborto Superadmin', :'superadmin_email',
   'superadmin', 'active', current_date, false, now());
