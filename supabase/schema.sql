-- Enums
create type user_role as enum ('ADMIN', 'SUPER_MANAGER', 'MANAGER', 'EMPLOYEE');
create type contract_type as enum ('CDI', 'CDD', 'INTERIM', 'STAGE', 'APPRENTISSAGE', 'STUDENT');
create type experience_level as enum ('NOUVEAU', 'VETERANT');

-- Profiles (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  role user_role default 'EMPLOYEE',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sites
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  address text,
  capacity int default 0,
  opening_hours jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Employees
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id),
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  employee_number text unique,
  contract_type contract_type default 'CDI',
  experience_level experience_level default 'NOUVEAU',
  hire_date date,
  weekly_hours float default 35.0,
  hourly_rate float,
  color text default '#3b82f6',
  is_student boolean default false,
  is_archived boolean default false,
  site_id uuid references public.sites(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.employees enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policies for Sites
create policy "Sites are viewable by everyone" on public.sites
  for select using (true);

create policy "Admins and Managers can insert sites" on public.sites
  for insert with check (true); -- Simplified for initial setup

create policy "Admins and Managers can update sites" on public.sites
  for update using (true); -- Simplified for initial setup

-- Policies for Employees
create policy "Employees viewable by authenticated users" on public.employees
  for select using (auth.role() = 'authenticated');

create policy "Admins/Managers manage employees" on public.employees
  for all using (true); -- Simplified for initial setup

-- Notifications
create type notification_type as enum ('info', 'success', 'warning', 'error');

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies for Notifications
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "System can insert notifications" on public.notifications
  for insert with check (true);
