-- Create skills table for categorizing services
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.skills enable row level security;

-- Allow public read access to skills
create policy "skills_select_public"
  on public.skills for select
  using (true);

-- Only authenticated users can suggest new skills
create policy "skills_insert_authenticated"
  on public.skills for insert
  with check (auth.uid() is not null);
