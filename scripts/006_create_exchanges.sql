-- Create exchanges table for tracking service exchanges
create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  request_id uuid references public.service_requests(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  provider_notes text,
  requester_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.exchanges enable row level security;

-- RLS policies for exchanges - users can only see exchanges they're part of
create policy "exchanges_select_participant"
  on public.exchanges for select
  using (auth.uid() = provider_id or auth.uid() = requester_id);

create policy "exchanges_insert_authenticated"
  on public.exchanges for insert
  with check (auth.uid() = provider_id or auth.uid() = requester_id);

create policy "exchanges_update_participant"
  on public.exchanges for update
  using (auth.uid() = provider_id or auth.uid() = requester_id);
