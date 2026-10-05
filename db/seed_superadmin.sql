-- Bootstrap the platform's initial superadmin identity.
--
-- Creates the active, non-public member record. seed.sh follows this with
-- seed_superadmin_login.mjs, which creates the password login from the
-- SUPERADMIN_PASSWORD environment variable (stored as a bcrypt hash).
insert into members
  (slug, name, email, platform_role, status, joined_at, is_public)
values
  ('biborto-superadmin', 'Biborto Superadmin',
   'superadmin@biborto11.com', 'superadmin', 'active', current_date, false);
