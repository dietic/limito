-- Enable pg_cron and schedule periodic cleanup of transient data
create extension if not exists pg_cron;

-- Function to cleanup expired rate limit windows and old click events
create or replace function public.cleanup_old_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Remove expired rate limit windows
  delete from public.rate_limits
  where window_expires_at < now();

  -- Retain click events for 30 days (free-plan retention)
  delete from public.click_events
  where clicked_at < (now() - interval '30 days');
end;
$$;

-- Schedule: run cleanup 5 minutes past every hour
do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'limito_cleanup_hourly'
  ) then
    perform cron.schedule(
      'limito_cleanup_hourly',
      '5 * * * *',
      $$call public.cleanup_old_data();$$
    );
  end if;
end $$;
