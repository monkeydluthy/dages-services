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
