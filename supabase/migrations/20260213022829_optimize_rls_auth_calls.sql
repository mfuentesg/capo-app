-- Optimize RLS Auth Function Calls (Performance Fix)
-- Wraps auth.uid() calls in subqueries to prevent re-evaluation for each row
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

-- ============================================================================
-- profiles policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles FOR
SELECT USING (
        (
            SELECT auth.uid ()
        ) = id
    );

DROP POLICY IF EXISTS "Team members can read teammate profiles" ON profiles;

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
                        user_id = (
                            SELECT auth.uid ()
                        )
                )
        )
    );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE
    USING (
        (
            SELECT auth.uid ()
        ) = id
    );

-- ============================================================================
-- teams policies
-- ============================================================================

DROP POLICY IF EXISTS "Team members can read their teams" ON teams;

CREATE POLICY "Team members can read their teams" ON teams FOR
SELECT USING (
        is_team_member (
            teams.id, (
                SELECT auth.uid ()
            )
        )
    );

DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;

CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT
WITH
    CHECK (
        (
            SELECT auth.uid ()
        ) IS NOT NULL
        AND (
            SELECT auth.uid ()
        ) = created_by
    );

DROP POLICY IF EXISTS "Owners and admins can update teams" ON teams;

CREATE POLICY "Owners and admins can update teams" ON teams
FOR UPDATE
    USING (
        has_team_permission (
            teams.id,
            (
                SELECT auth.uid ()
            ),
            'admin'
        )
    );

DROP POLICY IF EXISTS "Only owners can delete teams" ON teams;

CREATE POLICY "Only owners can delete teams" ON teams FOR DELETE USING (
    has_team_permission (
        teams.id,
        (
            SELECT auth.uid ()
        ),
        'owner'
    )
);

-- ============================================================================
-- team_members policies
-- ============================================================================

DROP POLICY IF EXISTS "Team members can read team members" ON team_members;

CREATE POLICY "Team members can read team members" ON team_members FOR
SELECT USING (
        is_team_member (
            team_members.team_id, (
                SELECT auth.uid ()
            )
        )
    );

-- ============================================================================
-- team_invitations policies
-- ============================================================================

DROP POLICY IF EXISTS "Team members can view invitations" ON team_invitations;

CREATE POLICY "Team members can view invitations" ON team_invitations FOR
SELECT USING (
        is_team_member (
            team_invitations.team_id, (
                SELECT auth.uid ()
            )
        )
    );

DROP POLICY IF EXISTS "Owners and admins can create invitations" ON team_invitations;

CREATE POLICY "Owners and admins can create invitations" ON team_invitations FOR INSERT
WITH
    CHECK (
        has_team_permission (
            team_invitations.team_id,
            (
                SELECT auth.uid ()
            ),
            'admin'
        )
        AND (
            SELECT auth.uid ()
        ) = invited_by
    );

DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON team_invitations;

CREATE POLICY "Owners and admins can delete invitations" ON team_invitations FOR DELETE USING (
    has_team_permission (
        team_invitations.team_id,
        (
            SELECT auth.uid ()
        ),
        'admin'
    )
);

-- ============================================================================
-- songs policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own songs" ON songs;

CREATE POLICY "Users can read own songs" ON songs FOR
SELECT USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can read team songs" ON songs;

CREATE POLICY "Team members can read team songs" ON songs FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (
            songs.team_id, (
                SELECT auth.uid ()
            )
        )
    );

DROP POLICY IF EXISTS "Users can create personal songs" ON songs;

CREATE POLICY "Users can create personal songs" ON songs FOR INSERT
WITH
    CHECK (
        user_id = (
            SELECT auth.uid ()
        )
        AND team_id IS NULL
        AND created_by = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can create team songs" ON songs;

CREATE POLICY "Team members can create team songs" ON songs FOR INSERT
WITH
    CHECK (
        team_id IS NOT NULL
        AND user_id IS NULL
        AND created_by = (
            SELECT auth.uid ()
        )
        AND has_team_permission (
            songs.team_id,
            (
                SELECT auth.uid ()
            ),
            'member'
        )
    );

DROP POLICY IF EXISTS "Users can update own songs" ON songs;

CREATE POLICY "Users can update own songs" ON songs
FOR UPDATE
    USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can update team songs" ON songs;

CREATE POLICY "Team members can update team songs" ON songs
FOR UPDATE
    USING (
        team_id IS NOT NULL
        AND has_team_permission (
            songs.team_id,
            (
                SELECT auth.uid ()
            ),
            'member'
        )
    );

DROP POLICY IF EXISTS "Users can delete own songs" ON songs;

CREATE POLICY "Users can delete own songs" ON songs FOR DELETE USING (
    user_id = (
        SELECT auth.uid ()
    )
);

DROP POLICY IF EXISTS "Team members can delete team songs" ON songs;

CREATE POLICY "Team members can delete team songs" ON songs FOR DELETE USING (
    team_id IS NOT NULL
    AND has_team_permission (
        songs.team_id,
        (
            SELECT auth.uid ()
        ),
        'admin'
    )
);

-- ============================================================================
-- playlists policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own playlists" ON playlists;

CREATE POLICY "Users can read own playlists" ON playlists FOR
SELECT USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can read team playlists" ON playlists;

CREATE POLICY "Team members can read team playlists" ON playlists FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (
            playlists.team_id, (
                SELECT auth.uid ()
            )
        )
    );

DROP POLICY IF EXISTS "Users can create personal playlists" ON playlists;

CREATE POLICY "Users can create personal playlists" ON playlists FOR INSERT
WITH
    CHECK (
        user_id = (
            SELECT auth.uid ()
        )
        AND team_id IS NULL
        AND created_by = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can create team playlists" ON playlists;

CREATE POLICY "Team members can create team playlists" ON playlists FOR INSERT
WITH
    CHECK (
        team_id IS NOT NULL
        AND user_id IS NULL
        AND created_by = (
            SELECT auth.uid ()
        )
        AND has_team_permission (
            playlists.team_id,
            (
                SELECT auth.uid ()
            ),
            'member'
        )
    );

DROP POLICY IF EXISTS "Users can update own playlists" ON playlists;

CREATE POLICY "Users can update own playlists" ON playlists
FOR UPDATE
    USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can update team playlists" ON playlists;

CREATE POLICY "Team members can update team playlists" ON playlists
FOR UPDATE
    USING (
        team_id IS NOT NULL
        AND has_team_permission (
            playlists.team_id,
            (
                SELECT auth.uid ()
            ),
            'member'
        )
    );

DROP POLICY IF EXISTS "Users can delete own playlists" ON playlists;

CREATE POLICY "Users can delete own playlists" ON playlists FOR DELETE USING (
    user_id = (
        SELECT auth.uid ()
    )
);

DROP POLICY IF EXISTS "Team members can delete team playlists" ON playlists;

CREATE POLICY "Team members can delete team playlists" ON playlists FOR DELETE USING (
    team_id IS NOT NULL
    AND has_team_permission (
        playlists.team_id,
        (
            SELECT auth.uid ()
        ),
        'admin'
    )
);

-- ============================================================================
-- playlist_songs policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own playlist songs" ON playlist_songs;

CREATE POLICY "Users can read own playlist songs" ON playlist_songs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
    );

DROP POLICY IF EXISTS "Team members can read team playlist songs" ON playlist_songs;

CREATE POLICY "Team members can read team playlist songs" ON playlist_songs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM playlists p
            WHERE
                p.id = playlist_songs.playlist_id
                AND p.team_id IS NOT NULL
                AND is_team_member (
                    p.team_id, (
                        SELECT auth.uid ()
                    )
                )
        )
    );

DROP POLICY IF EXISTS "Users can insert into own playlists" ON playlist_songs;

CREATE POLICY "Users can insert into own playlists" ON playlist_songs FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
    );

DROP POLICY IF EXISTS "Team members can insert into team playlists" ON playlist_songs;

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
                    (
                        SELECT auth.uid ()
                    ),
                    'member'
                )
        )
    );

DROP POLICY IF EXISTS "Users can update own playlist songs" ON playlist_songs;

CREATE POLICY "Users can update own playlist songs" ON playlist_songs
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
    );

DROP POLICY IF EXISTS "Team members can update team playlist songs" ON playlist_songs;

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
                    (
                        SELECT auth.uid ()
                    ),
                    'member'
                )
        )
    );

DROP POLICY IF EXISTS "Users can delete from own playlists" ON playlist_songs;

CREATE POLICY "Users can delete from own playlists" ON playlist_songs FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM playlists
        WHERE
            id = playlist_songs.playlist_id
            AND user_id = (
                SELECT auth.uid ()
            )
    )
);

DROP POLICY IF EXISTS "Team members can delete from team playlists" ON playlist_songs;

CREATE POLICY "Team members can delete from team playlists" ON playlist_songs FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM playlists p
        WHERE
            p.id = playlist_songs.playlist_id
            AND p.team_id IS NOT NULL
            AND has_team_permission (
                p.team_id,
                (
                    SELECT auth.uid ()
                ),
                'member'
            )
    )
);

-- ============================================================================
-- activity_log policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own activity" ON activity_log;

CREATE POLICY "Users can read own activity" ON activity_log FOR
SELECT USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Team members can read team activity" ON activity_log;

CREATE POLICY "Team members can read team activity" ON activity_log FOR
SELECT USING (
        team_id IS NOT NULL
        AND is_team_member (
            activity_log.team_id, (
                SELECT auth.uid ()
            )
        )
    );