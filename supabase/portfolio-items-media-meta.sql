-- Extra media fields for compressed uploads and gallery layout.
-- Safe to re-run.

alter table portfolio_items
  add column if not exists width int,
  add column if not exists height int,
  add column if not exists poster_url text,
  add column if not exists alt_text text;
