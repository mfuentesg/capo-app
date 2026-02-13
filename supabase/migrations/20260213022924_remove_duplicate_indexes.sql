-- Remove Duplicate Indexes (Performance Fix)
-- Drops redundant indexes that duplicate UNIQUE constraint indexes
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index

-- playlist_songs: Remove duplicate of UNIQUE constraint indexes
DROP INDEX IF EXISTS idx_playlist_songs_playlist_position;
-- Keeping: playlist_songs_playlist_id_position_key (created by UNIQUE constraint)

DROP INDEX IF EXISTS idx_playlist_songs_playlist_song;
-- Keeping: playlist_songs_playlist_id_song_id_key (created by UNIQUE constraint)

-- team_invitations: Remove duplicate of UNIQUE constraint index
DROP INDEX IF EXISTS idx_team_invitations_token;
-- Keeping: team_invitations_token_key (created by UNIQUE constraint)

-- team_members: Remove duplicate of UNIQUE constraint index
DROP INDEX IF EXISTS idx_team_members_team_user;
-- Keeping: team_members_team_id_user_id_key (created by UNIQUE constraint)