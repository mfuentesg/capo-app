-- Migration 2: RLS Policies
-- Enables Row Level Security and creates minimal policies (3-5 per table)
-- Helper functions are created first so policies can use them

-- ============================================================================
-- Helper Functions (needed by RLS policies)
-- ============================================================================

-- Check if user is a member of a team
CREATE OR REPLACE FUNCTION is_team_member(team_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = is_team_member.team_id
    AND team_members.user_id = is_team_member.user_id
  );
$$;

-- Get user's role in a team
CREATE OR REPLACE FUNCTION get_team_role(team_id UUID, user_id UUID)
RETURNS team_role_enum
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM team_members
  WHERE team_members.team_id = get_team_role.team_id
  AND team_members.user_id = get_team_role.user_id
  LIMIT 1;
$$;

-- Check if user has required role or higher
-- Role hierarchy: owner > admin > member > viewer
CREATE OR REPLACE FUNCTION has_team_permission(
  team_id UUID,
  user_id UUID,
  required_role team_role_enum
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role team_role_enum;
BEGIN
  SELECT get_team_role(has_team_permission.team_id, has_team_permission.user_id)
  INTO user_role;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Role hierarchy check
  CASE required_role
    WHEN 'viewer' THEN
      RETURN true; -- All roles can view
    WHEN 'member' THEN
      RETURN user_role IN ('owner', 'admin', 'member');
    WHEN 'admin' THEN
      RETURN user_role IN ('owner', 'admin');
    WHEN 'owner' THEN
      RETURN user_role = 'owner';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- profiles policies
-- ============================================================================

-- SELECT: Users can read their own profile, team members can read teammate profiles
CREATE POLICY "Users can read own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Team members can read teammate profiles" ON profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM team_members tm
            WHERE
                tm.user_id = profiles.id
                AND tm.team_id IN (
                    SELECT team_id
                    FROM team_members
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE
    USING (auth.uid () = id);

-- INSERT: Allow trigger to create profile on signup
-- The trigger runs with SECURITY DEFINER, but RLS still applies
-- We allow inserts when:
-- 1. The id matches the current authenticated user (for manual profile creation)
-- 2. OR the id exists in auth.users (for trigger-created profiles during signup)
-- Note: The trigger runs AFTER user creation in auth.users, so the user exists at that point
CREATE POLICY "Allow profile creation on signup" ON profiles FOR INSERT
WITH
    CHECK (
        -- Allow if id matches current user
        (
            SELECT auth.uid ()
        ) = id
        -- OR allow if id exists in auth.users (for trigger context)
        OR id IN (
            SELECT id
            FROM auth.users
        )
    );

-- ============================================================================
-- teams policies
-- ============================================================================

-- SELECT: Team members can read their teams, public teams visible to all
CREATE POLICY "Team members can read their teams" ON teams FOR
SELECT USING (
        is_team_member (teams.id, auth.uid ())
    );

CREATE POLICY "Public teams visible to all" ON teams FOR
SELECT USING (is_public = true);

-- INSERT: Authenticated users can create teams (becomes owner)
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND auth.uid () = created_by
    );

-- UPDATE: Owners and admins can update team details
CREATE POLICY "Owners and admins can update teams" ON teams
FOR UPDATE
    USING (
        has_team_permission (
            teams.id,
            auth.uid (),
            'admin'
        )
    );

-- DELETE: Only owners can delete teams
CREATE POLICY "Only owners can delete teams" ON teams FOR DELETE USING (
    has_team_permission (
        teams.id,
        auth.uid (),
        'owner'
    )
);

-- ============================================================================
-- team_members policies
-- ============================================================================

-- SELECT: Team members can read their team's members
CREATE POLICY "Team members can read team members" ON team_members FOR
SELECT USING (
        is_team_member (
            team_members.team_id, auth.uid ()
        )
    );

-- INSERT: Only owners/admins can add members (via RPC)
-- RPC function will handle the insert, so we restrict direct inserts
CREATE POLICY "Only system can insert team members" ON team_members FOR INSERT
WITH
    CHECK (false);

-- UPDATE: Only owners/admins can change roles (via RPC)
CREATE POLICY "Only system can update team members" ON team_members
FOR UPDATE
    USING (false);

-- DELETE: Only owners/admins can remove members (via RPC)
CREATE POLICY "Only system can delete team members" ON team_members FOR DELETE USING (false);

-- ============================================================================
-- team_invitations policies
-- ============================================================================

-- SELECT: Team members can view pending invitations
CREATE POLICY "Team members can view invitations" ON team_invitations FOR
SELECT USING (
        is_team_member (
            team_invitations.team_id, auth.uid ()
        )
    );

-- INSERT: Only owners/admins can create invitations
CREATE POLICY "Owners and admins can create invitations" ON team_invitations FOR INSERT
WITH
    CHECK (
        has_team_permission (
            team_invitations.team_id,
            auth.uid (),
            'admin'
        )
        AND auth.uid () = invited_by
    );

-- UPDATE: System can update acceptance status (via RPC)
CREATE POLICY "Only system can update invitations" ON team_invitations
FOR UPDATE
    USING (false);

-- DELETE: Only owners/admins can delete invitations
CREATE POLICY "Owners and admins can delete invitations" ON team_invitations FOR DELETE USING (
    has_team_permission (
        team_invitations.team_id,
        auth.uid (),
        'admin'
    )
);

-- ============================================================================
-- songs policies
-- ============================================================================

-- SELECT: Users can read their own songs, team members can read team songs
CREATE POLICY "Users can read own songs" ON songs FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Team members can read team songs" ON songs FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (songs.team_id, auth.uid ())
    );

-- INSERT: Users can create personal songs, team members can create team songs
CREATE POLICY "Users can create personal songs" ON songs FOR INSERT
WITH
    CHECK (
        user_id = auth.uid ()
        AND team_id IS NULL
        AND created_by = auth.uid ()
    );

CREATE POLICY "Team members can create team songs" ON songs FOR INSERT
WITH
    CHECK (
        team_id IS NOT NULL
        AND user_id IS NULL
        AND created_by = auth.uid ()
        AND has_team_permission (
            songs.team_id,
            auth.uid (),
            'member'
        )
    );

-- UPDATE: Users can update their own songs, team members can update team songs
CREATE POLICY "Users can update own songs" ON songs
FOR UPDATE
    USING (user_id = auth.uid ());

CREATE POLICY "Team members can update team songs" ON songs
FOR UPDATE
    USING (
        team_id IS NOT NULL
        AND has_team_permission (
            songs.team_id,
            auth.uid (),
            'member'
        )
    );

-- DELETE: Users can delete their own songs, team members can delete team songs
CREATE POLICY "Users can delete own songs" ON songs FOR DELETE USING (user_id = auth.uid ());

CREATE POLICY "Team members can delete team songs" ON songs FOR DELETE USING (
    team_id IS NOT NULL
    AND has_team_permission (
        songs.team_id,
        auth.uid (),
        'admin'
    )
);

-- ============================================================================
-- playlists policies
-- ============================================================================

-- SELECT: Users can read their own playlists, team members can read team playlists, public playlists visible to all
CREATE POLICY "Users can read own playlists" ON playlists FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Team members can read team playlists" ON playlists FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (
            playlists.team_id, auth.uid ()
        )
    );

CREATE POLICY "Public playlists visible to all" ON playlists FOR
SELECT USING (
        is_public = true
        AND (
            share_expires_at IS NULL
            OR share_expires_at > now()
        )
    );

-- INSERT: Users can create personal playlists, team members can create team playlists
CREATE POLICY "Users can create personal playlists" ON playlists FOR INSERT
WITH
    CHECK (
        user_id = auth.uid ()
        AND team_id IS NULL
        AND created_by = auth.uid ()
    );

CREATE POLICY "Team members can create team playlists" ON playlists FOR INSERT
WITH
    CHECK (
        team_id IS NOT NULL
        AND user_id IS NULL
        AND created_by = auth.uid ()
        AND has_team_permission (
            playlists.team_id,
            auth.uid (),
            'member'
        )
    );

-- UPDATE: Users can update their own playlists, team members can update team playlists
CREATE POLICY "Users can update own playlists" ON playlists
FOR UPDATE
    USING (user_id = auth.uid ());

CREATE POLICY "Team members can update team playlists" ON playlists
FOR UPDATE
    USING (
        team_id IS NOT NULL
        AND has_team_permission (
            playlists.team_id,
            auth.uid (),
            'member'
        )
    );

-- DELETE: Users can delete their own playlists, team members can delete team playlists
CREATE POLICY "Users can delete own playlists" ON playlists FOR DELETE USING (user_id = auth.uid ());

CREATE POLICY "Team members can delete team playlists" ON playlists FOR DELETE USING (
    team_id IS NOT NULL
    AND has_team_permission (
        playlists.team_id,
        auth.uid (),
        'admin'
    )
);

-- ============================================================================
-- playlist_songs policies
-- ============================================================================

-- SELECT: Same as playlists (inherits playlist access)
CREATE POLICY "Users can read own playlist songs" ON playlist_songs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Team members can read team playlist songs" ON playlist_songs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM playlists p
            WHERE
                p.id = playlist_songs.playlist_id
                AND p.team_id IS NOT NULL
                AND is_team_member (p.team_id, auth.uid ())
        )
    );

CREATE POLICY "Public playlist songs visible to all" ON playlist_songs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND is_public = true
                AND (
                    share_expires_at IS NULL
                    OR share_expires_at > now()
                )
        )
    );

-- INSERT: Users with playlist UPDATE permission
CREATE POLICY "Users can insert into own playlists" ON playlist_songs FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Team members can insert into team playlists" ON playlist_songs FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM playlists p
            WHERE
                p.id = playlist_songs.playlist_id
                AND p.team_id IS NOT NULL
                AND has_team_permission (
                    p.team_id,
                    auth.uid (),
                    'member'
                )
        )
    );

-- UPDATE: Users with playlist UPDATE permission (for reordering)
CREATE POLICY "Users can update own playlist songs" ON playlist_songs
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Team members can update team playlist songs" ON playlist_songs
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM playlists p
            WHERE
                p.id = playlist_songs.playlist_id
                AND p.team_id IS NOT NULL
                AND has_team_permission (
                    p.team_id,
                    auth.uid (),
                    'member'
                )
        )
    );

-- DELETE: Users with playlist UPDATE permission
CREATE POLICY "Users can delete from own playlists" ON playlist_songs FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM playlists
        WHERE
            id = playlist_songs.playlist_id
            AND user_id = auth.uid ()
    )
);

CREATE POLICY "Team members can delete from team playlists" ON playlist_songs FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM playlists p
        WHERE
            p.id = playlist_songs.playlist_id
            AND p.team_id IS NOT NULL
            AND has_team_permission (
                p.team_id,
                auth.uid (),
                'member'
            )
    )
);

-- ============================================================================
-- activity_log policies
-- ============================================================================

-- SELECT: Users can read their own activity, team members can read team activity
CREATE POLICY "Users can read own activity" ON activity_log FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Team members can read team activity" ON activity_log FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (
            activity_log.team_id, auth.uid ()
        )
    );

-- INSERT: System only (via triggers)
CREATE POLICY "Only system can insert activity" ON activity_log FOR INSERT
WITH
    CHECK (false);

-- UPDATE: System only
CREATE POLICY "Only system can update activity" ON activity_log
FOR UPDATE
    USING (false);

-- DELETE: System only
CREATE POLICY "Only system can delete activity" ON activity_log FOR DELETE USING (false);