-- Review-request email when a lead is marked closed.
-- Safe to re-run. Uses private.notify_settings (same secret/site_url as
-- photo alerts) so the webhook URL and secret are not hardcoded here.

alter table public.leads
  add column if not exists review_requested_at timestamptz;

create extension if not exists pg_net;

create or replace function private.notify_review_request()
returns trigger
language plpgsql
security definer
set search_path = public, private, net, extensions
as $$
declare
  settings private.notify_settings%rowtype;
  request_id bigint;
  endpoint text;
begin
  if new.status is distinct from 'closed' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from 'closed' then
    return new;
  end if;
  if new.review_requested_at is not null then
    return new;
  end if;

  select * into settings
  from private.notify_settings
  where id = 1;

  if coalesce(settings.site_url, '') = '' or coalesce(settings.webhook_secret, '') = '' then
    raise warning 'review request skipped: notify_settings missing';
    return new;
  end if;

  endpoint := rtrim(settings.site_url, '/') || '/.netlify/functions/send-review-request';

  begin
    select net.http_post(
      url := endpoint,
      body := jsonb_build_object(
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema,
        'record', to_jsonb(new),
        'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', settings.webhook_secret
      ),
      timeout_milliseconds := 5000
    ) into request_id;
  exception when others then
    raise warning 'review request webhook failed: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists leads_closed_review_request on public.leads;

create trigger leads_closed_review_request
after update of status on public.leads
for each row
when (new.status = 'closed' and old.status is distinct from 'closed')
execute function private.notify_review_request();

revoke all on function private.notify_review_request() from public, anon, authenticated;
