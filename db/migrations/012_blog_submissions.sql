-- Member blog submissions: a post a member submits waits in 'pending' until an
-- admin approves it (-> 'published') or rejects it (-> 'rejected'). 'draft' stays
-- the admin-internal working state. Enum order matches db/schema.sql.
alter type blog_status add value if not exists 'pending' before 'published';
alter type blog_status add value if not exists 'rejected';
