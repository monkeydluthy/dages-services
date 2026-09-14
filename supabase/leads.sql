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

-- Customers on /thank-you are anonymous and must not SELECT or UPDATE leads
-- (that would leak PII or let anyone change status). This RPC only appends
-- photo URLs for the lead id they already have from the thank-you URL.
create or replace function public.append_lead_photos(lead_id uuid, urls text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if urls is null or cardinality(urls) = 0 then
    return;
  end if;

  update public.leads
  set photo_urls = coalesce(photo_urls, '{}'::text[]) || urls
  where id = lead_id;

  if not found then
    raise exception 'lead not found';
  end if;
end;
$$;

revoke all on function public.append_lead_photos(uuid, text[]) from public;
grant execute on function public.append_lead_photos(uuid, text[]) to anon, authenticated;
