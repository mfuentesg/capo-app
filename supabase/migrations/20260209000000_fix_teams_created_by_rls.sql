-- Migration: Fix teams RLS by ensuring created_by matches auth.uid()
-- Adds a BEFORE INSERT trigger to force created_by to the authenticated user
-- This prevents RLS policy violations when client-supplied created_by doesn't match

-- Create function to set teams.created_by from auth.uid()
CREATE OR REPLACE FUNCTION set_teams_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Force created_by to current authenticated user
  NEW.created_by := auth.uid();

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (safe idempotent operation)
DROP TRIGGER IF EXISTS set_teams_created_by_trigger ON teams;

-- Create trigger to run BEFORE INSERT
CREATE TRIGGER set_teams_created_by_trigger
BEFORE INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION set_teams_created_by();
