-- Weekly SEO baseline snapshots. Safe to re-run.
-- Service role inserts from the Netlify scheduled function; no public access.

create table if not exists seo_snapshots (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  leads_last_7d int,
  indexed_pages int,
  mobile_performance int,
  mobile_lcp_ms int,
  desktop_performance int,
  desktop_lcp_ms int,
  gbp_views int,
  gbp_calls int,
  gbp_direction_requests int,
  gbp_website_clicks int,
  search_console_queries jsonb
);

alter table seo_snapshots enable row level security;

revoke all on table seo_snapshots from public, anon, authenticated;
