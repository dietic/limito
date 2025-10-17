create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_owner_select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_owner_update"
  on public.profiles for update
  using (auth.uid() = id);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  destination_url text not null,
  fallback_url text,
  mode text not null check (mode in ('by_date','by_clicks')),
  expires_at timestamp with time zone,
  click_limit integer,
  click_count integer not null default 0,
  last_clicked_at timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists links_owner_idx on public.links(owner_id);
create index if not exists links_slug_idx on public.links(slug);

alter table public.links enable row level security;

create policy "links_owner_select"
  on public.links for select
  using (auth.uid() = owner_id);

create policy "links_owner_modify"
  on public.links for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  clicked_at timestamp with time zone not null default now(),
  referrer text,
  user_agent text
);

create index if not exists click_events_link_idx on public.click_events(link_id);
create index if not exists click_events_clicked_at_idx on public.click_events(clicked_at);

alter table public.click_events enable row level security;

create policy "clicks_owner_select"
  on public.click_events for select
  using (exists(select 1 from public.links l where l.id = link_id and l.owner_id = auth.uid()));

