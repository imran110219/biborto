-- Sample sponsors.
-- SAMPLE CONTENT: invented demo data for development and tests. `seed.sh --core`
-- (use it for production) skips this file.
-- Depends on seed_businesses.sql: business_id is resolved by matching the sponsor's name to
-- a sample business (a sponsor does not have to be a business — see docs/db/README.md,
-- "Sponsors are not businesses"). logo_key is NULL: sponsors show their initials until a
-- real logo is uploaded. Websites use reserved .example domains.

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
