-- Migrates the 5 sample sponsors from web/lib/mock-data.ts into real
-- rows. Depends on seed_businesses.sql having run first — all 5 mock
-- sponsors happen to match a business by name, so business_id is
-- resolved via that match (see docs/db/README.md "Sponsors are not
-- businesses" for why this is a cross-link, not a requirement).
--
-- Known gap: logo_key is left NULL for all 5 — the mockup never had a
-- real sponsor logo file, only initials rendered by the Avatar
-- component (see schema.sql's comment on this column).

insert into sponsors
  (business_id, name, tier, website, active)
values
  ((select id from businesses where slug = 'gollamari-coffee-roasters'),
   'Gollamari Coffee Roasters', 'diamond', 'gollamaricoffee.example', true),

  ((select id from businesses where slug = 'islam-software-consulting'),
   'Islam Software Consulting', 'gold', 'islamconsulting.example', true),

  ((select id from businesses where slug = 'batchworks-catering'),
   'BatchWorks Catering', 'silver', 'batchworkscatering.example', true),

  ((select id from businesses where slug = 'hossain-network-solutions'),
   'Hossain Network Solutions', 'silver', 'hossainnetworks.example', true),

  ((select id from businesses where slug = 'begum-aquaculture-exports'),
   'Begum Aquaculture Exports', 'bronze', 'begumaquaculture.example', false);
