-- ============================================================================
-- SECURITY AUDIT: Role Change Tracking (V-002 Prevention)
-- ============================================================================
-- This code should be added at the end of schema.sql
-- Execute this in Supabase SQL Editor after the main schema is deployed

-- Audit table to track all role changes
create table if not exists public.role_change_audit (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  old_role user_role,
  new_role user_role,
  changed_by uuid references public.profiles(id),
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reason text
);

-- Enable RLS on audit table
alter table public.role_change_audit enable row level security;

-- Only admins can view audit logs
create policy "Admins can view role change audit" on public.role_change_audit
  for select using (
    public.get_my_role() in ('ADMIN', 'SUPER_MANAGER')
  );

-- Trigger function to automatically log role changes
create or replace function audit_role_change()
returns trigger as $$
begin
  if OLD.role IS DISTINCT FROM NEW.role then
    insert into public.role_change_audit (profile_id, old_role, new_role, changed_by)
    values (NEW.id, OLD.role, NEW.role, auth.uid());
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Attach trigger to profiles table
create trigger role_change_audit_trigger
  before update on public.profiles
  for each row
  execute function audit_role_change();
