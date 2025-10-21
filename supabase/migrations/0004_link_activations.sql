-- link_activations history per link (campaigns)
create table if not exists public.link_activations (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  mode text not null check (mode in ('by_date','by_clicks')),
  expires_at timestamp with time zone,
  click_limit integer,
  click_count integer not null default 0,
  activated_at timestamp with time zone not null default now(),
  deactivated_at timestamp with time zone,
  ended_reason text
);

-- fast lookups
create index if not exists link_activations_link_idx on public.link_activations(link_id);
create index if not exists link_activations_active_idx on public.link_activations(link_id, deactivated_at);

-- track current activation on links
alter table public.links add column if not exists current_activation_id uuid references public.link_activations(id);

-- RLS
alter table public.link_activations enable row level security;
create policy if not exists "activations_owner_select"
  on public.link_activations for select
  using (exists(select 1 from public.links l where l.id = link_id and l.owner_id = auth.uid()));
create policy if not exists "activations_owner_modify"
  on public.link_activations for all
  using (exists(select 1 from public.links l where l.id = link_id and l.owner_id = auth.uid()))
  with check (exists(select 1 from public.links l where l.id = link_id and l.owner_id = auth.uid()));
