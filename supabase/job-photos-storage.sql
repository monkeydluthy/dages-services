-- job-photos: public read, anon insert only at lead_id/filename

drop policy if exists "public read job photos" on storage.objects;
create policy "public read job photos"
on storage.objects
for select
to public
using (bucket_id = 'job-photos');

drop policy if exists "anon insert job photos" on storage.objects;
create policy "anon insert job photos"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'job-photos'
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] is null
);
