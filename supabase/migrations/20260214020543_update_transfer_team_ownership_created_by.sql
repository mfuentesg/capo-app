-- Keep teams.created_by in sync when ownership changes
CREATE OR REPLACE FUNCTION transfer_team_ownership(
	target_team_id UUID,
	new_owner_id UUID
)
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

	-- Check caller is owner
	caller_role := get_team_role(target_team_id, caller_id);
	IF caller_role != 'owner' THEN
		RAISE EXCEPTION 'Only team owner can transfer ownership';
	END IF;

	-- Check new owner is a member
	IF NOT is_team_member(target_team_id, new_owner_id) THEN
		RAISE EXCEPTION 'New owner must be a team member';
	END IF;

	-- Cannot transfer to self
	IF caller_id = new_owner_id THEN
		RAISE EXCEPTION 'Cannot transfer ownership to yourself';
	END IF;

	-- Update roles: old owner becomes admin, new owner becomes owner
	UPDATE team_members
	SET role = 'admin'
	WHERE team_id = target_team_id
	AND user_id = caller_id;

	UPDATE team_members
	SET role = 'owner'
	WHERE team_id = target_team_id
	AND user_id = new_owner_id;

	-- Update team owner reference
	UPDATE teams
	SET created_by = new_owner_id
	WHERE id = target_team_id;

	-- Log activity
	INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
	VALUES (
		caller_id,
		target_team_id,
		'team_ownership_transferred',
		'team',
		target_team_id,
		jsonb_build_object(
			'old_owner_id', caller_id,
			'new_owner_id', new_owner_id
		)
	);
END;
$$;