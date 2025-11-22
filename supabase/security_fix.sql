-- ============================================================================
-- SECURITY FIXES
-- ============================================================================

-- 1. Prevent Privilege Escalation in Profiles
-- Users should not be able to change their own role or organization_id
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

-- 2. Protect Organization Subscription Plan
-- Owners should not be able to change their subscription plan directly
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

-- 3. Verify RLS Policies (Double Check)
-- Ensure no "true" policies exist for updates
-- (Manual verification confirmed existing policies are scoped to auth.uid())
