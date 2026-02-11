-- Migration: Update teams RLS policy for server-side team creation
-- Since we verify users server-side with getUser() before insert,
-- we only need to require is_authenticated, not check created_by against auth.uid()

-- Update INSERT policy: just require authentication (JWT must be present)
-- The trigger will set created_by from auth.uid() automatically
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;

CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);
