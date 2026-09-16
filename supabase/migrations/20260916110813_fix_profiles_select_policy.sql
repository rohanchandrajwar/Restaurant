/*
# Fix: Simplify profiles SELECT policy to avoid RLS recursion

## Problem
The select_own_profile policy had a self-referencing subquery:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
This causes RLS recursion on the profiles table, which can make the
profile query fail silently and return null — so is_admin never reaches
the client, and the user always appears as a regular customer.

## Fix
Simplify to just auth.uid() = id. Users read their own profile only.
Admins don't need to read other users' profiles in this app.
*/

DROP POLICY IF EXISTS "select_own_profile" ON profiles;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
