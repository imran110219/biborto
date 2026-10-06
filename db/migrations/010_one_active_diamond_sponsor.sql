-- At most one *active* diamond sponsor (Diamond is the single exclusive top
-- tier). Inactive diamonds may coexist; the admin actions deactivate the
-- previous active diamond when another is activated, so the index is a
-- backstop rather than something admins normally trip over.
-- If an existing database has more than one active diamond, deactivate all
-- but one before applying.
create unique index sponsors_one_active_diamond_idx
  on sponsors (tier)
  where active and tier = 'diamond';
