-- Harden accept_team_invitation():
-- 1) Enforce email match so only invited user can accept.
-- 2) Keep idempotency for repeat accepts by existing members.
-- 3) Self-heal older incorrect acceptances by allowing the invited email
--    to be added if invitation is already marked accepted.

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
  v_user_email TEXT;
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

  -- Prefer JWT email, fall back to profile email.
  v_user_email := lower(NULLIF(auth.jwt() ->> 'email', ''));
  IF v_user_email IS NULL THEN
    SELECT lower(NULLIF(p.email, ''))
    INTO v_user_email
    FROM profiles p
    WHERE p.id = v_user_id;
  END IF;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User email not available';
  END IF;

  IF v_invitation_record.accepted_at IS NOT NULL THEN
    -- Idempotent repeat click by a current member.
    IF EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.team_id = v_team_id
        AND tm.user_id = v_user_id
    ) THEN
      RETURN v_team_id;
    END IF;

    -- Recovery path: older invitation may have been accepted by wrong account.
    -- If caller matches the invited email, allow them to be added too.
    IF v_user_email = lower(v_invitation_record.email) THEN
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (v_team_id, v_user_id, v_invitation_record.role)
      ON CONFLICT (team_id, user_id) DO NOTHING;

      RETURN v_team_id;
    END IF;

    RAISE EXCEPTION 'Invitation already accepted';
  END IF;

  IF v_invitation_record.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  IF v_user_email != lower(v_invitation_record.email) THEN
    RAISE EXCEPTION 'Invitation is for a different email address';
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
