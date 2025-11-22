-- ⚠️ CRITICAL SECURITY MIGRATION
-- Fix V-002: Auto-ADMIN Role Assignment Vulnerability
-- This script helps audit and fix existing ADMIN accounts

-- ============================================================================
-- STEP 1: AUDIT - List all current ADMIN accounts
-- ============================================================================
-- Execute this first to review who has ADMIN access
-- Look for suspicious accounts created recently or unknown emails

SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '7 days' THEN '⚠️ RECENT'
    ELSE '✓ OLD'
  END as account_age
FROM public.profiles
WHERE role = 'ADMIN'
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 2: REVIEW - Check if you recognize all these accounts
-- ============================================================================
-- Questions to ask yourself:
-- 1. Do you recognize all these email addresses?
-- 2. Were they all invited by you or a trusted admin?
-- 3. Are there any test accounts or suspicious names?
-- 4. Are there accounts created recently that shouldn't be ADMIN?

-- ============================================================================
-- STEP 3: DEMOTE - Remove ADMIN from unauthorized accounts
-- ============================================================================
-- ⚠️ ONLY execute this after careful review of STEP 1
-- Replace 'unauthorized-user-id-here' with actual suspicious user IDs

-- Example: Demote a specific user
-- UPDATE public.profiles
-- SET role = 'EMPLOYEE'
-- WHERE id = 'unauthorized-user-id-here';

-- Example: Demote all recently created ADMINs (DANGEROUS!)
-- Uncomment only if you're sure recent signups are unauthorized
-- UPDATE public.profiles
-- SET role = 'EMPLOYEE'
-- WHERE role = 'ADMIN'
--   AND created_at > NOW() - INTERVAL '7 days'
--   AND email NOT IN ('your-legitimate-admin@company.com');

-- ============================================================================
-- STEP 4: ENSURE - Make sure you have at least one legitimate ADMIN
-- ============================================================================
-- If you accidentally demoted yourself or need to promote a legitimate admin:

-- Promote specific user to ADMIN
-- UPDATE public.profiles
-- SET role = 'ADMIN'
-- WHERE email = 'your-legitimate-admin@company.com';

-- ============================================================================
-- STEP 5: VERIFY - Confirm the changes
-- ============================================================================

-- Check remaining ADMINs
SELECT 
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'ADMIN'
ORDER BY created_at;

-- Check demoted accounts
SELECT 
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'EMPLOYEE'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 6: AUDIT TRAIL - View role change history (if audit table exists)
-- ============================================================================

SELECT 
  p.email,
  rca.old_role,
  rca.new_role,
  rca.changed_at,
  changer.email as changed_by_email
FROM public.role_change_audit rca
JOIN public.profiles p ON rca.profile_id = p.id
LEFT JOIN public.profiles changer ON rca.changed_by = changer.id
ORDER BY rca.changed_at DESC
LIMIT 50;

-- ============================================================================
-- NOTES AND RECOMMENDATIONS
-- ============================================================================
-- 
-- 1. Execute STEP 1 first and carefully review the results
-- 2. Save the output for your records
-- 3. Only execute STEP 3 after confirming unauthorized accounts
-- 4. Always keep at least one ADMIN account (preferably yours)
-- 5. Consider using the invitation system for future ADMIN grants
-- 6. Monitor the role_change_audit table regularly for suspicious activity
-- 
-- Security Best Practices:
-- - Limit ADMIN accounts to 2-3 trusted individuals
-- - Use SUPER_MANAGER for operational managers
-- - Use MANAGER for site-level management
-- - Default EMPLOYEE for regular staff
-- - Review audit logs monthly
-- 
-- ============================================================================
