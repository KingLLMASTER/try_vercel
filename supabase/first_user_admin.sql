-- ============================================================================
-- AUTO-ADMIN FOR FIRST USER
-- ============================================================================
-- This trigger automatically assigns ADMIN role to the very first user
-- All subsequent users get EMPLOYEE role by default
-- This ensures the company founder can immediately use the application

CREATE OR REPLACE FUNCTION set_initial_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INTEGER;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  -- If this is the very first profile, make them ADMIN
  IF profile_count = 0 THEN
    NEW.role := 'ADMIN';
    
    -- Log this event for security audit
    RAISE NOTICE 'First user created with ADMIN role: %', NEW.email;
  ELSE
    -- All subsequent users get EMPLOYEE by default
    NEW.role := 'EMPLOYEE';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to profiles table
-- This runs BEFORE INSERT, so it sets the role before the profile is created
CREATE TRIGGER set_initial_admin_role_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_admin_role();

-- ============================================================================
-- USAGE NOTES:
-- ============================================================================
-- 1. The very first signup will receive ADMIN role automatically
-- 2. All other signups will receive EMPLOYEE role
-- 3. Admins can then use the invitation system to promote others
-- 4. This trigger works alongside the default role definition
--    (the trigger overrides the default for the first user)
-- ============================================================================
