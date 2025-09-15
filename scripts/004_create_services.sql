-- Create services table for service offerings
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  skill_ids uuid[] not null,
  estimated_hours integer,
  difficulty_level text check (difficulty_level in ('easy', 'medium', 'hard')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.services enable row level security;

-- RLS policies for services
create policy "services_select_own"
  on public.services for select
  using (auth.uid() = user_id);

create policy "services_insert_own"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "services_update_own"
  on public.services for update
  using (auth.uid() = user_id);

create policy "services_delete_own"
  on public.services for delete
  using (auth.uid() = user_id);

-- Allow public read access to active services
create policy "services_select_public_active"
  on public.services for select
  using (is_active = true);
