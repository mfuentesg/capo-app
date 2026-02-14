-- Fix gen_random_bytes resolution by calling the extensions schema explicitly

-- Auto-generate share_code if missing when playlist becomes public
CREATE OR REPLACE FUNCTION ensure_share_code(playlist_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
	share_code TEXT;
	playlist_record playlists%ROWTYPE;
BEGIN
	-- Get playlist
	SELECT * INTO playlist_record
	FROM playlists
	WHERE id = playlist_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'Playlist not found';
	END IF;

	-- If already has share_code, return it
	IF playlist_record.share_code IS NOT NULL THEN
		RETURN playlist_record.share_code;
	END IF;

	-- Generate new share_code (using nanoid-like approach with pgcrypto)
	-- Generate a random string: 12 characters, URL-safe
	LOOP
		share_code := encode(extensions.gen_random_bytes(9), 'base64');
		share_code := translate(share_code, '+/', '-_'); -- Make URL-safe
		share_code := substring(share_code from 1 for 12); -- Limit length

		-- Check if unique
		EXIT WHEN NOT EXISTS (
			SELECT 1 FROM playlists WHERE playlists.share_code = ensure_share_code.share_code
		);
	END LOOP;

	-- Update playlist
	UPDATE playlists
	SET share_code = ensure_share_code.share_code
	WHERE id = playlist_id;

	RETURN ensure_share_code.share_code;
END;
$$;

-- Allows team owners and admins to invite new members via email
CREATE OR REPLACE FUNCTION invite_team_member(
	target_team_id UUID,
	member_email TEXT,
	member_role team_role_enum DEFAULT 'member'::team_role_enum
)
RETURNS team_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
	caller_id UUID;
	caller_role team_role_enum;
	invitation_record team_invitations;
	invitation_token TEXT;
	expires_at TIMESTAMPTZ;
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

	-- Only owners and admins can invite members
	IF caller_role NOT IN ('owner', 'admin') THEN
		RAISE EXCEPTION 'Only owners and admins can invite members';
	END IF;

	-- Admins can only create member and viewer invitations
	IF caller_role = 'admin' AND member_role IN ('owner', 'admin') THEN
		RAISE EXCEPTION 'Admins can only invite members as member or viewer';
	END IF;

	-- Validate email format
	IF member_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
		RAISE EXCEPTION 'Invalid email format';
	END IF;

	-- Check if user with this email already exists as a member
	IF EXISTS (
		SELECT 1 FROM team_members tm
		JOIN profiles p ON tm.user_id = p.id
		WHERE tm.team_id = target_team_id
		AND p.email = member_email
	) THEN
		RAISE EXCEPTION 'User is already a member of this team';
	END IF;

	-- Check if invitation already exists and is not expired
	IF EXISTS (
		SELECT 1 FROM team_invitations
		WHERE team_id = target_team_id
		AND email = member_email
		AND accepted_at IS NULL
		AND team_invitations.expires_at > now()
	) THEN
		RAISE EXCEPTION 'An invitation for this email already exists';
	END IF;

	-- Generate invitation token (32 character hex string)
	invitation_token := encode(extensions.gen_random_bytes(16), 'hex');

	-- Set expiration to 7 days from now
	expires_at := now() + INTERVAL '7 days';

	-- Create invitation
	INSERT INTO team_invitations (
		team_id,
		email,
		token,
		role,
		invited_by,
		expires_at
	) VALUES (
		target_team_id,
		member_email,
		invitation_token,
		member_role,
		caller_id,
		expires_at
	)
	RETURNING * INTO invitation_record;

	-- Log activity
	INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
	VALUES (
		caller_id,
		target_team_id,
		'team_member_invited',
		'team_member',
		invitation_record.id,
		jsonb_build_object(
			'email', member_email,
			'role', member_role,
			'invited_by', caller_id
		)
	);

	RETURN invitation_record;
END;
$$;