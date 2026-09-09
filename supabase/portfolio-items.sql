-- Canonical portfolio_items schema + RLS.
-- If you already created the table from the 4.2 card, only run the
-- authenticated read policy at the bottom.

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  media_type text not null,
  media_url text not null,
  job_type text,
  sort_order int not null default 0
);

alter table portfolio_items enable row level security;

drop policy if exists "public read" on portfolio_items;
create policy "public read"
  on portfolio_items for select to anon using (true);

drop policy if exists "authenticated read" on portfolio_items;
create policy "authenticated read"
  on portfolio_items for select to authenticated using (true);

drop policy if exists "authenticated write" on portfolio_items;
create policy "authenticated write"
  on portfolio_items for insert to authenticated with check (true);

drop policy if exists "authenticated update" on portfolio_items;
create policy "authenticated update"
  on portfolio_items for update to authenticated using (true);

drop policy if exists "authenticated delete" on portfolio_items;
create policy "authenticated delete"
  on portfolio_items for delete to authenticated using (true);
