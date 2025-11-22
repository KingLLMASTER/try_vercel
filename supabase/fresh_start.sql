-- ============================================================================
-- FLUX PLAN - FRESH START SCRIPT
-- ============================================================================
-- ⚠️ WARNING: This script will DELETE ALL DATA and recreate the database structure.
-- It includes:
-- 1. Full Database Reset (Drop Schema)
-- 2. Multi-Tenant Schema Creation
-- 3. Security Fixes (Privilege Escalation Prevention)
-- ============================================================================

-- 1. RESET DATABASE
-- ============================================================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Enable extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- 2. CREATE SCHEMA
-- ============================================================================

-- ENUMS
create type user_role as enum ('ADMIN', 'SUPER_MANAGER', 'MANAGER', 'EMPLOYEE');
create type contract_type as enum ('CDI', 'CDD', 'INTERIM', 'STAGE', 'APPRENTISSAGE', 'STUDENT');
create type experience_level as enum ('NOUVEAU', 'VETERANT');
create type leave_type as enum ('PAID_LEAVE', 'SICK_LEAVE', 'EXAM', 'OTHER');
create type leave_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type assignment_status as enum ('PROPOSED', 'CONFIRMED', 'DECLINED');
create type notification_type as enum ('info', 'success', 'warning', 'error');

-- TABLES

-- 1. Organizations
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique,
  owner_id uuid references auth.users(id),
  subscription_plan text default 'FREE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  first_name text,
  last_name text,
  email text,
  role user_role default 'EMPLOYEE',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Sites
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  code text not null,
  address text,
  capacity int default 0,
  opening_hours jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, code)
);

-- 4. Employees
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id),
  site_id uuid references public.sites(id),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  employee_number text,
  contract_type contract_type default 'CDI',
  experience_level experience_level default 'NOUVEAU',
  hire_date date,
  weekly_hours float default 35.0,
  hourly_rate float,
  color text default '#3b82f6',
  is_student boolean default false,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, employee_number),
  unique(organization_id, email)
);

-- 5. Shifts
create table public.shifts (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete cascade not null,
  title text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  required_role user_role,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Shift Assignments
create table public.shift_assignments (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  shift_id uuid references public.shifts(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  status assignment_status default 'PROPOSED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Leave Requests
create table public.leave_requests (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  type leave_type default 'PAID_LEAVE',
  reason text,
  status leave_status default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Documents
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Invitations
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  token uuid default gen_random_uuid() not null unique,
  role user_role not null,
  expires_at timestamp with time zone default (now() + interval '7 days') not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type notification_type default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HELPER FUNCTIONS
create or replace function public.get_my_organization_id()
returns uuid 
language sql 
security definer
set search_path = public, pg_temp
as $$
  select organization_id from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.get_my_role()
returns user_role 
language sql 
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- RLS POLICIES
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.employees enable row level security;
alter table public.shifts enable row level security;
alter table public.shift_assignments enable row level security;
alter table public.leave_requests enable row level security;
alter table public.documents enable row level security;
alter table public.invitations enable row level security;
alter table public.notifications enable row level security;

-- Organizations
create policy "users_view_own_organization" on public.organizations
  for select using (id = public.get_my_organization_id());

create policy "owners_update_organization" on public.organizations
  for update using (owner_id = auth.uid());

-- Profiles
create policy "users_view_org_profiles" on public.profiles
  for select using (organization_id = public.get_my_organization_id());

create policy "users_update_own_profile" on public.profiles
  for update using (id = auth.uid());

-- Sites
create policy "users_view_org_sites" on public.sites
  for select using (organization_id = public.get_my_organization_id());

create policy "admins_manage_sites" on public.sites
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Employees
create policy "users_view_org_employees" on public.employees
  for select using (organization_id = public.get_my_organization_id());

create policy "admins_manage_employees" on public.employees
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Shifts
create policy "users_view_org_shifts" on public.shifts
  for select using (organization_id = public.get_my_organization_id());

create policy "managers_manage_shifts" on public.shifts
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
  );

-- Shift Assignments
create policy "users_view_org_assignments" on public.shift_assignments
  for select using (organization_id = public.get_my_organization_id());

create policy "managers_manage_assignments" on public.shift_assignments
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER', 'MANAGER')
  );

-- Leave Requests
create policy "users_view_org_leaves" on public.leave_requests
  for select using (organization_id = public.get_my_organization_id());

create policy "employees_create_own_leave" on public.leave_requests
  for insert with check (
    organization_id = public.get_my_organization_id()
    and employee_id in (select id from public.employees where profile_id = auth.uid())
  );

create policy "admins_manage_leaves" on public.leave_requests
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Documents
create policy "users_view_org_documents" on public.documents
  for select using (organization_id = public.get_my_organization_id());

create policy "admins_manage_documents" on public.documents
  for all using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Invitations
create policy "admins_view_invitations" on public.invitations
  for select using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "admins_create_invitations" on public.invitations
  for insert with check (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

create policy "admins_delete_invitations" on public.invitations
  for delete using (
    organization_id = public.get_my_organization_id() 
    and public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Notifications
create policy "users_view_own_notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "users_update_own_notifications" on public.notifications
  for update using (user_id = auth.uid());

-- TRIGGERS
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer
set search_path = public, pg_temp
as $$
declare
  new_org_id uuid;
  org_name text;
  user_first_name text;
  user_last_name text;
begin
  -- Extract metadata
  org_name := new.raw_user_meta_data->>'company_name';
  user_first_name := new.raw_user_meta_data->>'first_name';
  user_last_name := new.raw_user_meta_data->>'last_name';

  -- Create new organization
  insert into public.organizations (name, owner_id)
  values (coalesce(org_name, 'My Organization'), new.id)
  returning id into new_org_id;

  -- Create profile as ADMIN of new organization
  insert into public.profiles (id, organization_id, email, first_name, last_name, role)
  values (
    new.id,
    new_org_id,
    new.email,
    user_first_name,
    user_last_name,
    'ADMIN'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.claim_invitation(invitation_token uuid)
returns void 
language plpgsql 
security definer
set search_path = public, pg_temp
as $$
declare
  invitation_record public.invitations%ROWTYPE;
begin
  select * into invitation_record from public.invitations
  where token = invitation_token
  and expires_at > now();

  if invitation_record is null then
    raise exception 'Invalid or expired invitation';
  end if;

  -- Update user profile to join the organization
  update public.profiles
  set 
    organization_id = invitation_record.organization_id,
    role = invitation_record.role
  where id = auth.uid();

  -- Delete used invitation
  delete from public.invitations where id = invitation_record.id;
end;
$$;

-- INDEXES
create index idx_profiles_organization_id on public.profiles(organization_id);
create index idx_sites_organization_id on public.sites(organization_id, is_active);
create index idx_employees_organization_id on public.employees(organization_id, is_archived);
create index idx_shifts_organization_time on public.shifts(organization_id, start_time, end_time);
create index idx_shift_assignments_organization on public.shift_assignments(organization_id, shift_id, employee_id);
create index idx_leave_requests_organization on public.leave_requests(organization_id, status);
create index idx_documents_organization on public.documents(organization_id, employee_id);
create index idx_invitations_organization on public.invitations(organization_id, expires_at);
create index idx_notifications_user on public.notifications(user_id, read, created_at);

-- 3. APPLY SECURITY FIXES
-- ============================================================================

-- Prevent Privilege Escalation in Profiles
create or replace function public.prevent_profile_sensitive_updates()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Check if role is being changed
  if new.role is distinct from old.role then
    raise exception 'You cannot change your own role.';
  end if;

  -- Check if organization_id is being changed
  if new.organization_id is distinct from old.organization_id then
    raise exception 'You cannot change your organization.';
  end if;

  return new;
end;
$$;

create trigger on_profile_update_security
  before update on public.profiles
  for each row
  execute procedure public.prevent_profile_sensitive_updates();

-- Protect Organization Subscription Plan
create or replace function public.prevent_subscription_updates()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.subscription_plan is distinct from old.subscription_plan then
    raise exception 'Subscription plan cannot be changed directly.';
  end if;
  return new;
end;
$$;

create trigger on_organization_update_security
  before update on public.organizations
  for each row
  execute procedure public.prevent_subscription_updates();

-- ============================================================================
-- FRESH START COMPLETE
-- ============================================================================
