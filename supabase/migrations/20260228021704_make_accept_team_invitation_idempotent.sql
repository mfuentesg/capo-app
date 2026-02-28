-- Make accept_team_invitation() safe-idempotent for repeated clicks.
-- If invitation is already accepted and caller is already a team member,
-- return team_id instead of raising an error.

CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation_record team_invitations%ROWTYPE;
  v_user_id UUID;
  v_team_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_invitation_record
  FROM team_invitations ti
  WHERE ti.token = accept_team_invitation.invitation_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  v_team_id := v_invitation_record.team_id;

  -- Idempotency: repeated accept by an already-added member should succeed.
  -- Keep the existing error for non-members to avoid broadening access.
  IF v_invitation_record.accepted_at IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.team_id = v_team_id
        AND tm.user_id = v_user_id
    ) THEN
      RETURN v_team_id;
    END IF;

    RAISE EXCEPTION 'Invitation already accepted';
  END IF;

  IF v_invitation_record.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, v_user_id, v_invitation_record.role)
  ON CONFLICT (team_id, user_id) DO NOTHING;

  UPDATE team_invitations ti
  SET accepted_at = now()
  WHERE ti.id = v_invitation_record.id;

  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_user_id,
    v_team_id,
    'team_invitation_accepted',
    'team_invitation',
    v_invitation_record.id,
    jsonb_build_object('role', v_invitation_record.role)
  );

  RETURN v_team_id;
END;
$$;
