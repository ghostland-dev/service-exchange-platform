-- Create service_requests table for service needs
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  skill_ids uuid[] not null,
  estimated_hours integer,
  urgency text check (urgency in ('low', 'medium', 'high')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.service_requests enable row level security;

-- RLS policies for service_requests
create policy "service_requests_select_own"
  on public.service_requests for select
  using (auth.uid() = user_id);

create policy "service_requests_insert_own"
  on public.service_requests for insert
  with check (auth.uid() = user_id);

create policy "service_requests_update_own"
  on public.service_requests for update
  using (auth.uid() = user_id);

create policy "service_requests_delete_own"
  on public.service_requests for delete
  using (auth.uid() = user_id);

-- Allow public read access to active requests
create policy "service_requests_select_public_active"
  on public.service_requests for select
  using (is_active = true);
