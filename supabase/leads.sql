create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  job_type text not null,
  urgency text not null,
  notes text,
  is_emergency boolean not null default false,
  status text not null default 'new',
  source text not null default 'landing_page',
  photo_urls text[]
);

create index leads_created_at_idx on leads (created_at desc);
create index leads_status_idx on leads (status);

alter table leads enable row level security;

create policy "public insert only"
  on leads for insert to anon with check (true);

drop policy if exists "authenticated read leads" on leads;
create policy "authenticated read leads"
  on leads for select to authenticated using (true);

drop policy if exists "authenticated update leads" on leads;
create policy "authenticated update leads"
  on leads for update to authenticated using (true);

-- Secrets for photo alerts live here, not in Netlify env. Postgres cannot
-- read Netlify SITE_URL / WEBHOOK_SECRET. Insert the SAME values once:
--   insert into private.notify_settings (site_url, webhook_secret)
--   values ('https://dages-services.netlify.app', 'your-webhook-secret')
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

create extension if not exists pgcrypto with schema extensions;

-- Customers on /thank-you are anonymous and must not SELECT or UPDATE leads.
-- This RPC appends photo URLs, then returns a token the thank-you page uses
-- to call notify-photos-added. Joe changing status in admin does not mint
-- a token, so it cannot fire this alert.
drop function if exists public.append_lead_photos(uuid, text[]);

create function public.append_lead_photos(lead_id uuid, urls text[])
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  added int;
  photo_count int;
  lead_name text;
  lead_job text;
  lead_phone text;
  notify_secret text;
  notify_token text;
begin
  if urls is null or cardinality(urls) = 0 then
    return '{}'::jsonb;
  end if;

  added := cardinality(urls);

  update public.leads
  set photo_urls = coalesce(photo_urls, '{}'::text[]) || urls
  where id = lead_id
  returning name, job_type, phone, cardinality(coalesce(photo_urls, '{}'::text[]))
  into lead_name, lead_job, lead_phone, photo_count;

  if not found then
    raise exception 'lead not found';
  end if;

  select webhook_secret into notify_secret
  from private.notify_settings
  where id = 1;

  if coalesce(notify_secret, '') <> '' then
    notify_token := encode(
      hmac(lead_id::text || ':' || photo_count::text, notify_secret, 'sha256'),
      'hex'
    );
  end if;

  return jsonb_build_object(
    'lead_id', lead_id,
    'name', lead_name,
    'job_type', lead_job,
    'phone', lead_phone,
    'added_count', added,
    'photo_count', photo_count,
    'token', notify_token
  );
end;
$$;

revoke all on function public.append_lead_photos(uuid, text[]) from public;
grant execute on function public.append_lead_photos(uuid, text[]) to anon, authenticated;
