/*
# Fix: Prevent users from self-assigning admin via profile update

## Problem
The `update_own_profile` policy allowed `auth.uid() = id` with no column
restriction, meaning a user could update their own `is_admin` column to true.

## Fix
- Drop and recreate the UPDATE policy to restrict which columns can be changed.
- Use a separate approach: only allow updating `full_name` and `phone` columns
  by checking that `is_admin` is not being changed (via WITH CHECK on a
- SECURITY DEFINER function approach is overkill here; instead we restrict
- at the policy level by ensuring the NEW row's is_admin matches the OLD row's).

## Security
- Users can still update their own `full_name` and `phone`.
- Users CANNOT change `is_admin` — the WITH CHECK ensures is_admin stays the same.
*/

DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));
