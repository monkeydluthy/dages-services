-- portfolio-media: public read, authenticated write only (Joe's gallery)

drop policy if exists "public read portfolio media" on storage.objects;
create policy "public read portfolio media"
on storage.objects
for select
to public
using (bucket_id = 'portfolio-media');

drop policy if exists "authenticated insert portfolio media" on storage.objects;
create policy "authenticated insert portfolio media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio-media');

drop policy if exists "authenticated update portfolio media" on storage.objects;
create policy "authenticated update portfolio media"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-media')
with check (bucket_id = 'portfolio-media');

drop policy if exists "authenticated delete portfolio media" on storage.objects;
create policy "authenticated delete portfolio media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-media');
