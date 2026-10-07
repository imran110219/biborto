-- Committee-editable site settings (organization name, contact email, social links,
-- Grand Reunion fee and deadline), edited at /admin/settings. One row per setting;
-- keys are the SETTING_KEYS in web/lib/settings.ts. A missing row means "not set".
create table site_settings (
  key         text        primary key,
  value       text        not null,
  updated_at  timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();
