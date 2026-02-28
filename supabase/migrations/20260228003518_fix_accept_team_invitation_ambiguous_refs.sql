-- Fix accept_team_invitation() ambiguous references (Postgres 42702)
-- Uses explicit variable names and qualified function parameter access.

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

  IF v_invitation_record.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation already accepted';
  END IF;

  IF v_invitation_record.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  v_team_id := v_invitation_record.team_id;

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
