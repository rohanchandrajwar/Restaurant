/*
# Fix: Simplify update_own_profile to avoid RLS recursion

## Problem
Previous fix used a subquery against profiles in WITH CHECK, which
causes RLS recursion on the profiles table.

## Fix
Use a simple auth.uid() = id check. To prevent users from escalating
themselves to admin, revoke the column-level UPDATE privilege on is_admin
so only the service role (bypasses RLS) can change it.
*/

-- Revoke all column privileges first
REVOKE ALL ON profiles FROM authenticated;

-- Grant SELECT on all columns
GRANT SELECT ON profiles TO authenticated;

-- Grant UPDATE on only the columns users should be able to change
GRANT UPDATE (full_name, phone) ON profiles TO authenticated;

-- Grant INSERT on all columns (needed for trigger-created profiles)
GRANT INSERT ON profiles TO authenticated;

-- Simple policy: users can only update their own row
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep INSERT policy simple
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
