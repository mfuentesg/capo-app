-- Consolidate Multiple Permissive RLS Policies (Performance Fix)
-- Combines overlapping policies with OR logic to reduce policy evaluation overhead
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

-- ============================================================================
-- profiles: Consolidate 2 SELECT policies into 1
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

DROP POLICY IF EXISTS "Team members can read teammate profiles" ON profiles;

CREATE POLICY "Users and teammates can read profiles" ON profiles FOR
SELECT USING (
        -- Own profile
        (
            SELECT auth.uid ()
        ) = id
        -- OR teammate profile
        OR EXISTS (
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

-- ============================================================================
-- teams: Consolidate 2 SELECT policies into 1
-- ============================================================================

DROP POLICY IF EXISTS "Team members can read their teams" ON teams;

DROP POLICY IF EXISTS "Public teams visible to all" ON teams;

CREATE POLICY "Teams readable by members or if public" ON teams FOR
SELECT USING (
        -- Team member
        is_team_member (
            teams.id, (
                SELECT auth.uid ()
            )
        )
        -- OR public team
        OR is_public = true
    );

-- ============================================================================
-- songs: Consolidate policies (2 SELECT, 2 INSERT, 2 UPDATE, 2 DELETE → 4 total)
-- ============================================================================

-- SELECT: Consolidate own + team
DROP POLICY IF EXISTS "Users can read own songs" ON songs;

DROP POLICY IF EXISTS "Team members can read team songs" ON songs;

CREATE POLICY "Users can read own or team songs" ON songs FOR
SELECT USING (
        -- Own songs
        user_id = (
            SELECT auth.uid ()
        )
        -- OR team songs
        OR (
            team_id IS NOT NULL
            AND is_team_member (
                songs.team_id, (
                    SELECT auth.uid ()
                )
            )
        )
    );

-- INSERT: Consolidate personal + team
DROP POLICY IF EXISTS "Users can create personal songs" ON songs;

DROP POLICY IF EXISTS "Team members can create team songs" ON songs;

CREATE POLICY "Users can create personal or team songs" ON songs FOR INSERT
WITH
    CHECK (
        -- Personal songs
        (
            user_id = (
                SELECT auth.uid ()
            )
            AND team_id IS NULL
            AND created_by = (
                SELECT auth.uid ()
            )
        )
        -- OR team songs
        OR (
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
        )
    );

-- UPDATE: Consolidate own + team
DROP POLICY IF EXISTS "Users can update own songs" ON songs;

DROP POLICY IF EXISTS "Team members can update team songs" ON songs;

CREATE POLICY "Users can update own or team songs" ON songs
FOR UPDATE
    USING (
        -- Own songs
        user_id = (
            SELECT auth.uid ()
        )
        -- OR team songs
        OR (
            team_id IS NOT NULL
            AND has_team_permission (
                songs.team_id,
                (
                    SELECT auth.uid ()
                ),
                'member'
            )
        )
    );

-- DELETE: Consolidate own + team
DROP POLICY IF EXISTS "Users can delete own songs" ON songs;

DROP POLICY IF EXISTS "Team members can delete team songs" ON songs;

CREATE POLICY "Users can delete own or team songs" ON songs FOR DELETE USING (
    -- Own songs
    user_id = (
        SELECT auth.uid ()
    )
    -- OR team songs (admins only)
    OR (
        team_id IS NOT NULL
        AND has_team_permission (
            songs.team_id,
            (
                SELECT auth.uid ()
            ),
            'admin'
        )
    )
);

-- ============================================================================
-- playlists: Consolidate policies (3 SELECT, 2 INSERT, 2 UPDATE, 2 DELETE → 4 total)
-- ============================================================================

-- SELECT: Consolidate own + team + public
DROP POLICY IF EXISTS "Users can read own playlists" ON playlists;

DROP POLICY IF EXISTS "Team members can read team playlists" ON playlists;

DROP POLICY IF EXISTS "Public playlists visible to all" ON playlists;

CREATE POLICY "Playlists readable by owner, team, or if public" ON playlists FOR
SELECT USING (
        -- Own playlists
        user_id = (
            SELECT auth.uid ()
        )
        -- OR team playlists
        OR (
            team_id IS NOT NULL
            AND is_team_member (
                playlists.team_id, (
                    SELECT auth.uid ()
                )
            )
        )
        -- OR public playlists
        OR (
            is_public = true
            AND (
                share_expires_at IS NULL
                OR share_expires_at > now()
            )
        )
    );

-- INSERT: Consolidate personal + team
DROP POLICY IF EXISTS "Users can create personal playlists" ON playlists;

DROP POLICY IF EXISTS "Team members can create team playlists" ON playlists;

CREATE POLICY "Users can create personal or team playlists" ON playlists FOR INSERT
WITH
    CHECK (
        -- Personal playlists
        (
            user_id = (
                SELECT auth.uid ()
            )
            AND team_id IS NULL
            AND created_by = (
                SELECT auth.uid ()
            )
        )
        -- OR team playlists
        OR (
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
        )
    );

-- UPDATE: Consolidate own + team
DROP POLICY IF EXISTS "Users can update own playlists" ON playlists;

DROP POLICY IF EXISTS "Team members can update team playlists" ON playlists;

CREATE POLICY "Users can update own or team playlists" ON playlists
FOR UPDATE
    USING (
        -- Own playlists
        user_id = (
            SELECT auth.uid ()
        )
        -- OR team playlists
        OR (
            team_id IS NOT NULL
            AND has_team_permission (
                playlists.team_id,
                (
                    SELECT auth.uid ()
                ),
                'member'
            )
        )
    );

-- DELETE: Consolidate own + team
DROP POLICY IF EXISTS "Users can delete own playlists" ON playlists;

DROP POLICY IF EXISTS "Team members can delete team playlists" ON playlists;

CREATE POLICY "Users can delete own or team playlists" ON playlists FOR DELETE USING (
    -- Own playlists
    user_id = (
        SELECT auth.uid ()
    )
    -- OR team playlists (admins only)
    OR (
        team_id IS NOT NULL
        AND has_team_permission (
            playlists.team_id,
            (
                SELECT auth.uid ()
            ),
            'admin'
        )
    )
);

-- ============================================================================
-- playlist_songs: Consolidate policies (3 SELECT, 2 INSERT, 2 UPDATE, 2 DELETE → 4 total)
-- ============================================================================

-- SELECT: Consolidate own + team + public
DROP POLICY IF EXISTS "Users can read own playlist songs" ON playlist_songs;

DROP POLICY IF EXISTS "Team members can read team playlist songs" ON playlist_songs;

DROP POLICY IF EXISTS "Public playlist songs visible to all" ON playlist_songs;

CREATE POLICY "Playlist songs readable by owner, team, or if public" ON playlist_songs FOR
SELECT USING (
        -- Own playlist songs
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
        -- OR team playlist songs
        OR EXISTS (
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
        -- OR public playlist songs
        OR EXISTS (
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

-- INSERT: Consolidate own + team
DROP POLICY IF EXISTS "Users can insert into own playlists" ON playlist_songs;

DROP POLICY IF EXISTS "Team members can insert into team playlists" ON playlist_songs;

CREATE POLICY "Users can insert into own or team playlists" ON playlist_songs FOR INSERT
WITH
    CHECK (
        -- Own playlists
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
        -- OR team playlists
        OR EXISTS (
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

-- UPDATE: Consolidate own + team
DROP POLICY IF EXISTS "Users can update own playlist songs" ON playlist_songs;

DROP POLICY IF EXISTS "Team members can update team playlist songs" ON playlist_songs;

CREATE POLICY "Users can update own or team playlist songs" ON playlist_songs
FOR UPDATE
    USING (
        -- Own playlists
        EXISTS (
            SELECT 1
            FROM playlists
            WHERE
                id = playlist_songs.playlist_id
                AND user_id = (
                    SELECT auth.uid ()
                )
        )
        -- OR team playlists
        OR EXISTS (
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

-- DELETE: Consolidate own + team
DROP POLICY IF EXISTS "Users can delete from own playlists" ON playlist_songs;

DROP POLICY IF EXISTS "Team members can delete from team playlists" ON playlist_songs;

CREATE POLICY "Users can delete from own or team playlists" ON playlist_songs FOR DELETE USING (
    -- Own playlists
    EXISTS (
        SELECT 1
        FROM playlists
        WHERE
            id = playlist_songs.playlist_id
            AND user_id = (
                SELECT auth.uid ()
            )
    )
    -- OR team playlists
    OR EXISTS (
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
-- activity_log: Consolidate 2 SELECT policies into 1
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own activity" ON activity_log;

DROP POLICY IF EXISTS "Team members can read team activity" ON activity_log;

CREATE POLICY "Users can read own or team activity" ON activity_log FOR
SELECT USING (
        -- Own activity
        user_id = (
            SELECT auth.uid ()
        )
        -- OR team activity
        OR (
            team_id IS NOT NULL
            AND is_team_member (
                activity_log.team_id, (
                    SELECT auth.uid ()
                )
            )
        )
    );