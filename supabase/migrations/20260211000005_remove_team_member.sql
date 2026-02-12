-- Migration: Add remove_team_member function
-- Allows team owners and admins to remove members from teams

CREATE OR REPLACE FUNCTION remove_team_member(
  target_team_id UUID,
  target_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
  caller_role team_role_enum;
  target_role team_role_enum;
BEGIN
  -- Get current user
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check caller's role
  caller_role := get_team_role(target_team_id, caller_id);
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this team';
  END IF;

  -- Only owners and admins can remove members
  IF caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only owners and admins can remove members';
  END IF;

  -- Get target user's current role
  target_role := get_team_role(target_team_id, target_user_id);
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user is not a member of this team';
  END IF;

  -- Cannot remove owner
  IF target_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove team owner';
  END IF;

  -- Admins can only remove members/viewers (not other admins or owner)
  IF caller_role = 'admin' AND target_role IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Admins can only remove members or viewers';
  END IF;

  -- Remove member from team
  DELETE FROM team_members
  WHERE team_id = target_team_id
  AND user_id = target_user_id;

  -- Log activity
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (
    caller_id,
    target_team_id,
    'team_member_removed',
    'team_member',
    target_user_id,
    jsonb_build_object(
      'role', target_role,
      'target_user_id', target_user_id
    )
  );
END;
$$;