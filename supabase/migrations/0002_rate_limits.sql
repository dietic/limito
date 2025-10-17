create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  key text not null,
  window_expires_at timestamp with time zone not null,
  count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists rate_limits_scope_key_idx on public.rate_limits(scope, key);
create index if not exists rate_limits_expires_idx on public.rate_limits(window_expires_at);

alter table public.rate_limits enable row level security;
