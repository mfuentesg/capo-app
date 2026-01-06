-- Migration: Fix profile INSERT policy for signup trigger
-- This fixes the issue where new users cannot be created due to missing INSERT policy
-- The handle_new_user() trigger needs this policy to insert profiles on signup

-- INSERT: Allow trigger to create profile on signup
-- The trigger runs with SECURITY DEFINER, but RLS still applies
-- We allow inserts when:
-- 1. The id matches the current authenticated user (for manual profile creation)
-- 2. OR the id exists in auth.users (for trigger-created profiles during signup)
-- Note: The trigger runs AFTER user creation in auth.users, so the user exists at that point
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (
    -- Allow if id matches current user
    (SELECT auth.uid()) = id
    -- OR allow if id exists in auth.users (for trigger context)
    OR id IN (SELECT id FROM auth.users)
  );

