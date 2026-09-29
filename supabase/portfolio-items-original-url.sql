-- Keep the pre-compression media URL so a backfill can roll back
-- without deleting the original storage object.
-- Safe to re-run.

alter table portfolio_items
  add column if not exists original_media_url text;
