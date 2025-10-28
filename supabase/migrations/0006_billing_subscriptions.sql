-- Billing subscriptions table for Lemon Squeezy
-- Stores provider subscription metadata and status per user.

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null default 'lemonsqueezy',
  provider_customer_id text,
  provider_subscription_id text,
  variant_id bigint,
  status text not null default 'inactive',
  is_active boolean not null default false,
  current_period_end timestamp with time zone,
  renews_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists billing_subscriptions_user_idx on public.billing_subscriptions(user_id);
create index if not exists billing_subscriptions_provider_sub_idx on public.billing_subscriptions(provider_subscription_id);

-- Ensure at most one active subscription per user (partial unique index)
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='billing_subscriptions_one_active_per_user_idx'
  ) then
    execute 'create unique index billing_subscriptions_one_active_per_user_idx on public.billing_subscriptions(user_id) where is_active = true';
  end if;
end $$;

alter table public.billing_subscriptions enable row level security;

-- Allow users to read their own subscription records
do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'billing_subscriptions' and p.policyname = 'billing_subscriptions_owner_select'
  ) then
    create policy "billing_subscriptions_owner_select"
      on public.billing_subscriptions for select
      using (auth.uid() = user_id);
  end if;
end $$;

-- Do NOT allow clients to modify billing data; only service role via API/webhooks.
-- No insert/update/delete policies are created (RLS blocks non-service writes).

-- Trigger to keep updated_at fresh
create or replace function public.tg_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'billing_subscriptions_touch_updated_at'
  ) then
    create trigger billing_subscriptions_touch_updated_at
      before update on public.billing_subscriptions
      for each row execute function public.tg_touch_updated_at();
  end if;
end $$;
