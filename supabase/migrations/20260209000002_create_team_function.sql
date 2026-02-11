-- Migration: Create a database function for team creation
-- This function wraps the INSERT with proper authentication context
-- and automatically adds the creator as an owner member

-- Drop the previous trigger since we're now using a function
DROP TRIGGER IF EXISTS set_teams_created_by_trigger ON teams;

DROP FUNCTION IF EXISTS set_teams_created_by ();

CREATE OR REPLACE FUNCTION create_team_with_owner(
  team_name TEXT,
  team_description TEXT DEFAULT NULL,
  team_is_public BOOLEAN DEFAULT FALSE,
  team_icon TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  is_public BOOLEAN,
  icon TEXT,
  avatar_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_team_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert the team
  INSERT INTO teams (name, description, is_public, icon, created_by)
  VALUES (team_name, team_description, team_is_public, team_icon, current_user_id)
  RETURNING teams.id, teams.name, teams.description, teams.is_public, teams.icon,
            teams.avatar_url, teams.created_by, teams.created_at, teams.updated_at
  INTO id, name, description, is_public, icon, avatar_url, created_by, created_at, updated_at;

  -- Store the team ID for the team_members insert
  new_team_id := id;

  -- Add the creator as an owner member (if not already added by trigger)
  INSERT INTO team_members (team_id, user_id, role, joined_at)
  VALUES (new_team_id, current_user_id, 'owner'::team_role_enum, NOW())
  ON CONFLICT (team_id, user_id) DO NOTHING;

  RETURN NEXT;
END;
$$;

-- Update INSERT policy to allow all authenticated users
-- The actual authorization happens in the create_team_with_owner function
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;

CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);
