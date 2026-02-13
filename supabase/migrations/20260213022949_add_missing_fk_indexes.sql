-- Add Missing Foreign Key Indexes (Performance Fix)
-- Creates indexes on foreign key columns to improve JOIN and lookup performance
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

-- Index for playlists.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_playlists_created_by ON playlists (created_by);

-- Index for songs.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_songs_created_by ON songs (created_by);

-- Index for team_invitations.invited_by foreign key
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_by ON team_invitations (invited_by);