-- First-touch attribution for public lead submissions.
-- Safe to re-run.

alter table leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text,
  add column if not exists landing_path text;

-- New columns are not covered by existing column-level INSERT grants.
-- Without this, public form submits fail RLS even when the fields are null.
grant insert (utm_source, utm_medium, utm_campaign, referrer, landing_path)
  on table public.leads to anon;

notify pgrst, 'reload schema';
