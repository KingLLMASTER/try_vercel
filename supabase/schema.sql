-- Enums
create type user_role as enum ('ADMIN', 'SUPER_MANAGER', 'MANAGER', 'EMPLOYEE');
create type contract_type as enum ('CDI', 'CDD', 'INTERIM', 'STAGE', 'APPRENTISSAGE', 'STUDENT');
create type experience_level as enum ('NOUVEAU', 'VETERANT');
create type leave_type as enum ('PAID_LEAVE', 'SICK_LEAVE', 'EXAM', 'OTHER');
create type leave_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type assignment_status as enum ('PROPOSED', 'CONFIRMED', 'DECLINED');

-- Profiles (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  role user_role default 'ADMIN', -- Default to ADMIN for public signups
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper to get current user role
create or replace function public.get_my_role()
returns user_role as $$
declare
  _role user_role;
begin
  select role into _role from public.profiles where id = auth.uid();
  return _role;
end;
$$ language plpgsql security definer;

-- Invitations
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  token uuid default gen_random_uuid() not null unique,
  role user_role not null,
  expires_at timestamp with time zone default (now() + interval '7 days') not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to claim invitation
create or replace function public.claim_invitation(invitation_token uuid)
returns void as $$
declare
  _invitation public.invitations%ROWTYPE;
begin
  -- Check if invitation exists and is valid
  select * into _invitation from public.invitations
  where token = invitation_token
  and expires_at > now();

  if _invitation is null then
    raise exception 'Invitation invalide ou expirée';
  end if;

  -- Update user profile with role from invitation
  update public.profiles
  set role = _invitation.role
  where id = auth.uid();

  -- Delete invitation (single use)
  delete from public.invitations where id = _invitation.id;
end;
$$ language plpgsql security definer;

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

-- Leave Requests
create table public.leave_requests (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) not null,
  start_date date not null,
  end_date date not null,
  type leave_type default 'PAID_LEAVE',
  reason text,
  status leave_status default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents (Medical Certs, etc.)
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) not null,
  name text not null,
  file_path text not null,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shift Assignments
create table public.shift_assignments (
  id uuid default gen_random_uuid() primary key,
  shift_id uuid references public.shifts(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  status assignment_status default 'PROPOSED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.sites enable row level security;
alter table public.employees enable row level security;
alter table public.leave_requests enable row level security;
alter table public.documents enable row level security;
alter table public.shift_assignments enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policies for Invitations
create policy "Admins and Super Managers can view invitations" on public.invitations
  for select using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Admins and Super Managers can insert invitations" on public.invitations
  for insert with check (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Admins and Super Managers can delete invitations" on public.invitations
  for delete using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Policies for Sites
create policy "Sites are viewable by everyone" on public.sites
  for select using (true);

create policy "Admins and Super Managers can insert sites" on public.sites
  for insert with check (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Admins and Super Managers can update sites" on public.sites
  for update using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Admins and Super Managers can delete sites" on public.sites
  for delete using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Policies for Employees
create policy "Employees viewable by authenticated users" on public.employees
  for select using (auth.role() = 'authenticated');

create policy "Admins and Super Managers can manage employees" on public.employees
  for all using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Policies for Leave Requests
create policy "Users can view their own leave requests" on public.leave_requests
  for select using (
    employee_id in (select id from public.employees where profile_id = auth.uid())
    or public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Users can insert their own leave requests" on public.leave_requests
  for insert with check (
    employee_id in (select id from public.employees where profile_id = auth.uid())
  );

create policy "Admins and Super Managers can update leave requests" on public.leave_requests
  for update using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Policies for Documents
create policy "Users can view their own documents" on public.documents
  for select using (
    employee_id in (select id from public.employees where profile_id = auth.uid())
    or public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "Users can insert their own documents" on public.documents
  for insert with check (
    employee_id in (select id from public.employees where profile_id = auth.uid())
  );

-- Policies for Shift Assignments
create policy "Shift assignments viewable by everyone" on public.shift_assignments
  for select using (true);

create policy "Admins and Super Managers can manage shift assignments" on public.shift_assignments
  for all using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

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

create policy "Admins and Super Managers can insert notifications" on public.notifications
  for insert with check (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );
