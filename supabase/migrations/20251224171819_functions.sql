-- Migration 3: Functions and Triggers
-- Creates RPCs for business logic and triggers for automation
-- Note: Helper functions (is_team_member, get_team_role, has_team_permission)
-- are created in Migration 2 so RLS policies can use them

-- ============================================================================
-- Business Logic Functions (RPCs)
-- ============================================================================

-- Safely change a team member's role
CREATE OR REPLACE FUNCTION change_team_member_role(
  target_team_id UUID,
  target_user_id UUID,
  new_role team_role_enum
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
  caller_role team_role_enum;
  target_current_role team_role_enum;
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

  -- Only owners and admins can change roles
  IF caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only owners and admins can change roles';
  END IF;

  -- Get target user's current role
  target_current_role := get_team_role(target_team_id, target_user_id);
  IF target_current_role IS NULL THEN
    RAISE EXCEPTION 'Target user is not a member of this team';
  END IF;

  -- Cannot demote owner
  IF target_current_role = 'owner' AND new_role != 'owner' THEN
    RAISE EXCEPTION 'Cannot demote team owner';
  END IF;

  -- Admins can only promote to member/viewer (not owner/admin)
  IF caller_role = 'admin' AND new_role IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Admins can only promote to member or viewer';
  END IF;

  -- Update the role
  UPDATE team_members
  SET role = new_role
  WHERE team_id = target_team_id
  AND user_id = target_user_id;

  -- Log activity
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (
    caller_id,
    target_team_id,
    'team_member_role_changed',
    'team_member',
    target_user_id,
    jsonb_build_object(
      'old_role', target_current_role,
      'new_role', new_role,
      'target_user_id', target_user_id
    )
  );
END;
$$;

-- Accept a team invitation by token
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record team_invitations%ROWTYPE;
  user_id UUID;
  team_id UUID;
BEGIN
  -- Get current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find invitation
  SELECT * INTO invitation_record
  FROM team_invitations
  WHERE token = invitation_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  -- Check if already accepted
  IF invitation_record.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation already accepted';
  END IF;

  -- Check if expired
  IF invitation_record.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  -- Check if user email matches (if we have email in profile)
  -- Note: This assumes the user's email matches the invitation email
  -- You may want to add additional validation here

  team_id := invitation_record.team_id;

  -- Create team_members entry
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (team_id, user_id, invitation_record.role)
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Mark invitation as accepted
  UPDATE team_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  -- Log activity
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (
    user_id,
    team_id,
    'team_invitation_accepted',
    'team',
    team_id,
    jsonb_build_object('role', invitation_record.role)
  );

  RETURN team_id;
END;
$$;

-- Transfer team ownership
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

-- Auto-generate share_code if missing when playlist becomes public
CREATE OR REPLACE FUNCTION ensure_share_code(playlist_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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
    share_code := encode(gen_random_bytes(9), 'base64');
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

-- ============================================================================
-- Trigger Functions
-- ============================================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create profile when new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Automatically add team creator as owner in team_members
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Log activity for songs/playlists changes
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_name TEXT;
  entity_type_name TEXT;
  entity_id_val UUID;
  user_id_val UUID;
  team_id_val UUID;
  metadata_val JSONB;
BEGIN
  -- Determine action and entity type based on table
  IF TG_TABLE_NAME = 'songs' THEN
    entity_type_name := 'song';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.user_id, OLD.user_id);
    team_id_val := COALESCE(NEW.team_id, OLD.team_id);

    IF TG_OP = 'INSERT' THEN
      action_name := 'song_created';
      metadata_val := jsonb_build_object('title', NEW.title);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'song_updated';
      metadata_val := jsonb_build_object(
        'title', NEW.title,
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'song_deleted';
      metadata_val := jsonb_build_object('title', OLD.title);
    END IF;

  ELSIF TG_TABLE_NAME = 'playlists' THEN
    entity_type_name := 'playlist';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.user_id, OLD.user_id);
    team_id_val := COALESCE(NEW.team_id, OLD.team_id);

    IF TG_OP = 'INSERT' THEN
      action_name := 'playlist_created';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'playlist_updated';
      metadata_val := jsonb_build_object(
        'name', NEW.name,
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'playlist_deleted';
      metadata_val := jsonb_build_object('name', OLD.name);
    END IF;

  ELSIF TG_TABLE_NAME = 'teams' THEN
    entity_type_name := 'team';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.created_by, OLD.created_by);
    team_id_val := COALESCE(NEW.id, OLD.id);

    IF TG_OP = 'INSERT' THEN
      action_name := 'team_created';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'team_updated';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'team_deleted';
      metadata_val := jsonb_build_object('name', OLD.name);
    END IF;
  END IF;

  -- Insert activity log
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (user_id_val, team_id_val, action_name, entity_type_name, entity_id_val, metadata_val);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Optional: Cleanup expired share codes (can be called via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove share codes from playlists where share has expired
  UPDATE playlists
  SET share_code = NULL,
      is_public = false
  WHERE is_public = true
  AND share_expires_at IS NOT NULL
  AND share_expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at for tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add team creator as owner member
CREATE TRIGGER on_team_created
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- Log activity for songs
CREATE TRIGGER log_song_activity
  AFTER INSERT OR UPDATE OR DELETE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

-- Log activity for playlists
CREATE TRIGGER log_playlist_activity
  AFTER INSERT OR UPDATE OR DELETE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

-- Log activity for teams
CREATE TRIGGER log_team_activity
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION log_activity();

-- Auto-generate share_code when playlist becomes public
CREATE OR REPLACE FUNCTION auto_ensure_share_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If playlist is being made public and has no share_code, generate one
  IF NEW.is_public = true AND NEW.share_code IS NULL THEN
    NEW.share_code := ensure_share_code(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_share_code_on_public
  BEFORE INSERT OR UPDATE ON playlists
  FOR EACH ROW
  WHEN (NEW.is_public = true)
  EXECUTE FUNCTION auto_ensure_share_code();