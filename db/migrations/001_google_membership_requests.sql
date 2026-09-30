-- Allow Google sign-ins without a pre-existing member record to enter the
-- admin approval queue before their discipline/profile details are known.
alter table members alter column discipline_id drop not null;
