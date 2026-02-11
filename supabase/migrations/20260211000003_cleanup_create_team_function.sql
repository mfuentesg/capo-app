-- Migration: Clean up create_team_with_owner function - remove old signature
-- There are two versions of this function; we need to drop both and recreate with only the correct signature

DROP FUNCTION IF EXISTS create_team_with_owner(TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS create_team_with_owner(TEXT, BOOLEAN, TEXT);

CREATE FUNCTION create_team_with_owner(
  team_name TEXT,
  team_is_public BOOLEAN DEFAULT FALSE,
  team_icon TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
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
  INSERT INTO teams (name, is_public, icon, created_by)
  VALUES (team_name, team_is_public, team_icon, current_user_id)
  RETURNING teams.id, teams.name, teams.is_public, teams.icon,
            teams.avatar_url, teams.created_by, teams.created_at, teams.updated_at
  INTO id, name, is_public, icon, avatar_url, created_by, created_at, updated_at;

  -- Store the team ID for the team_members insert
  new_team_id := id;

  -- Add the creator as an owner member (if not already added by trigger)
  INSERT INTO team_members (team_id, user_id, role, joined_at)
  VALUES (new_team_id, current_user_id, 'owner'::team_role_enum, NOW())
  ON CONFLICT (team_id, user_id) DO NOTHING;

  RETURN NEXT;
END;
$$;
