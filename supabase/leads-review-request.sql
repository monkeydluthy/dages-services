-- Review-request webhook when a lead is marked closed.
-- Same mechanism as notify-lead: supabase_functions.http_request (Database Webhook).
-- Safe to re-run. URL and secret come from private.notify_settings.
--
-- If the DO block raises "notify_settings is missing", insert once using
-- SITE_URL and WEBHOOK_SECRET from Netlify / .env (do not commit the secret):
--   insert into private.notify_settings (id, site_url, webhook_secret)
--   values (1, 'https://dagesservices.com', 'YOUR_WEBHOOK_SECRET')
--   on conflict (id) do update
--     set site_url = excluded.site_url,
--         webhook_secret = excluded.webhook_secret;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.notify_settings (
  id int primary key default 1 check (id = 1),
  site_url text not null,
  webhook_secret text not null
);

alter table private.notify_settings enable row level security;
revoke all on table private.notify_settings from public, anon, authenticated;

alter table public.leads
  add column if not exists review_requested_at timestamptz;

create extension if not exists pg_net;

drop trigger if exists leads_closed_review_request on public.leads;
drop function if exists private.notify_review_request();

do $$
declare
  settings private.notify_settings%rowtype;
  endpoint text;
  headers jsonb;
begin
  select * into settings
  from private.notify_settings
  where id = 1;

  if coalesce(settings.site_url, '') = '' or coalesce(settings.webhook_secret, '') = '' then
    raise exception 'private.notify_settings is missing site_url or webhook_secret';
  end if;

  endpoint := rtrim(settings.site_url, '/') || '/.netlify/functions/send-review-request';
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-webhook-secret', settings.webhook_secret
  );

  execute format(
    $t$
    create trigger leads_closed_review_request
    after update of status on public.leads
    for each row
    when (new.status = 'closed' and old.status is distinct from 'closed')
    execute function supabase_functions.http_request(%L, %L, %L, %L, %L)
    $t$,
    endpoint,
    'POST',
    headers::text,
    '{}',
    '5000'
  );
end;
$$;

select
  (select site_url from private.notify_settings where id = 1) as site_url,
  exists (select 1 from pg_extension where extname = 'pg_net') as pg_net,
  (
    select string_agg(tgname, ', ' order by tgname)
    from pg_trigger
    where tgrelid = 'public.leads'::regclass
      and not tgisinternal
  ) as triggers;
