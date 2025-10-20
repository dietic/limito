create or replace view public.links_with_status as
select
  l.*,
  (
    (not l.is_active) OR
    (l.mode = 'by_date' and l.expires_at is not null and l.expires_at <= now()) OR
    (l.mode = 'by_clicks' and l.click_limit is not null and l.click_count >= l.click_limit)
  ) as is_expired
from public.links l;

-- RLS applies from base table `public.links`.

