-- Normalize public.profiles to Limi.to minimal shape and ensure constraints/policies
-- This migration is idempotent and safe to run multiple times.

-- Ensure table exists with minimal columns
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamp with time zone not null default now()
);

-- Drop any extraneous columns not part of the minimal contract
do $$
declare
  col record;
begin
  for col in
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name not in ('id','plan','created_at')
  loop
    execute format('alter table public.profiles drop column if exists %I cascade', col.column_name);
  end loop;
end $$;

-- Ensure column types/defaults/nullability
do $$
begin
  -- id must be uuid
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='id' and data_type <> 'uuid'
  ) then
    alter table public.profiles
      alter column id type uuid using id::uuid;
  end if;

  -- plan must be text not null default 'free'
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='plan'
  ) then
    alter table public.profiles add column plan text;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='plan' and data_type <> 'text'
  ) then
    alter table public.profiles alter column plan type text using plan::text;
  end if;
  update public.profiles set plan = 'free' where plan is null;
  alter table public.profiles alter column plan set default 'free';
  alter table public.profiles alter column plan set not null;

  -- created_at must exist with default now()
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='created_at'
  ) then
    alter table public.profiles add column created_at timestamp with time zone;
  end if;
  alter table public.profiles alter column created_at set default now();
  update public.profiles set created_at = now() where created_at is null;
  alter table public.profiles alter column created_at set not null;
end $$;

-- Ensure FK to auth.users(id) exists (default name profiles_id_fkey)
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.profiles'::regclass
      and c.contype = 'f'
      and c.conkey = array[ (
        select attnum from pg_attribute
        where attrelid = 'public.profiles'::regclass and attname = 'id'
      ) ]
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- RLS and policies (idempotent)
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'profiles_owner_select'
  ) then
    create policy "profiles_owner_select"
      on public.profiles for select
      using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'profiles' and p.policyname = 'profiles_owner_update'
  ) then
    create policy "profiles_owner_update"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;

-- Note: We intentionally do not attempt to drop unknown enum types automatically here
-- to avoid removing types used by extensions or future features. If needed, run a manual
-- cleanup with a targeted list of unused enum types in the public schema.
