-- Tag portfolio uploads by city so area pages can filter job photos.
alter table portfolio_items
  add column if not exists city text;
