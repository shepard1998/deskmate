-- Minimal database round trip for the scheduled keep-alive workflow
-- (.github/workflows/keepalive.yml). Free-tier projects pause after a week
-- without activity; calling this function through the API counts as activity.
-- It reads no table data, so it is safe to expose to anonymous callers.
create function public.keepalive()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

revoke execute on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
