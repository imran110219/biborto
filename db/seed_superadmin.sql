-- Bootstrap the platform's initial superadmin identity.
--
-- This creates an active member record only. The owner claims it at
-- /signup with this email and chooses a password; no password or login
-- credential is stored in seed data.
insert into members
  (slug, name, discipline_id, email, platform_role, status, joined_at, is_public)
values
  ('biborto-superadmin', 'Biborto Superadmin',
   (select id from disciplines where code = '01'),
   'superadmin@biborto11.com', 'superadmin', 'active', current_date, false);
