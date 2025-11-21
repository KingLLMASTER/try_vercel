-- Availabilities
create type availability_type as enum ('AVAILABLE', 'UNAVAILABLE', 'PREFERRED');

create table public.availabilities (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  date date not null,
  start_time time,
  end_time time,
  type availability_type default 'AVAILABLE',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.availabilities enable row level security;

create policy "Users can view their own availabilities" on public.availabilities
  for select using (
    exists (
      select 1 from public.employees
      where employees.id = availabilities.employee_id
      and employees.profile_id = auth.uid()
    )
    or 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
    )
  );

create policy "Users can manage their own availabilities" on public.availabilities
  for all using (
    exists (
      select 1 from public.employees
      where employees.id = availabilities.employee_id
      and employees.profile_id = auth.uid()
    )
  );

create policy "Managers can view all availabilities" on public.availabilities
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and role in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
    )
  );
