-- Fixed-window counters for rate limiting (sign-in failures, password-reset and
-- claim emails, password-change attempts, member photo uploads). One row per
-- (key, window); keys look like "signin:email:<address>" or "signin:ip:<addr>".
-- Rows are tiny and short-lived; the app deletes expired ones opportunistically.
create table rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (key, window_start)
);

create index rate_limits_window_idx on rate_limits (window_start);
