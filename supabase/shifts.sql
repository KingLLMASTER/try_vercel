-- Shifts
create type shift_status as enum ('DRAFT', 'PUBLISHED', 'LOCKED', 'CLOSED');

create table public.shifts (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  title text,
  color text default '#3b82f6',
  required_skills jsonb default '[]'::jsonb, -- ["NURSE", "DRIVER"]
  max_employees int default 1,
  status shift_status default 'DRAFT',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shift Assignments
create type assignment_status as enum ('PROPOSED', 'CONFIRMED', 'CANCELLED');

create table public.shift_assignments (
  id uuid default gen_random_uuid() primary key,
  shift_id uuid references public.shifts(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  status assignment_status default 'PROPOSED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(shift_id, employee_id) -- Prevent double booking on same shift
);

-- RLS
alter table public.shifts enable row level security;
alter table public.shift_assignments enable row level security;

-- Policies for Shifts
create policy "Shifts viewable by everyone" on public.shifts
  for select using (true);

create policy "Admins/Managers manage shifts" on public.shifts
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
    )
  );

-- Policies for Assignments
create policy "Assignments viewable by everyone" on public.shift_assignments
  for select using (true);

create policy "Admins/Managers manage assignments" on public.shift_assignments
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
    )
  );
