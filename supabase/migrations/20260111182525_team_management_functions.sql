-- Migration: Add leave_team function
-- Allows users to leave a team (cannot leave if owner unless transferring ownership first)

-- Leave a team function
CREATE OR REPLACE FUNCTION leave_team(target_team_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
  caller_role team_role_enum;
BEGIN
  -- Get current user
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check caller is a member
  caller_role := get_team_role(target_team_id, caller_id);
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this team';
  END IF;

  -- Cannot leave if owner (must transfer ownership first)
  IF caller_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot leave team as owner. Please transfer ownership first.';
  END IF;

  -- Remove member from team
  DELETE FROM team_members
  WHERE team_id = target_team_id
  AND user_id = caller_id;

  -- Log activity
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (
    caller_id,
    target_team_id,
    'team_member_left',
    'team_member',
    caller_id,
    jsonb_build_object(
      'role', caller_role,
      'user_id', caller_id
    )
  );
END;
$$;
