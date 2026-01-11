-- Migration 1: Core Schema
-- Creates all tables, constraints, and indexes for the Capo app

-- Create ENUMs
CREATE TYPE team_role_enum AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TYPE song_status_enum AS ENUM ('draft', 'published', 'archived');

-- 1. profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles (email);

-- 2. teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR NOT NULL,

    description TEXT,
    avatar_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE
);

CREATE INDEX idx_teams_created_by ON teams (created_by);

CREATE INDEX idx_teams_is_public ON teams (is_public);



-- 3. team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    role team_role_enum NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members (team_id);

CREATE INDEX idx_team_members_user_id ON team_members (user_id);

CREATE INDEX idx_team_members_role ON team_members (role);

CREATE UNIQUE INDEX idx_team_members_team_user ON team_members (team_id, user_id);

-- 4. team_invitations table
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    email VARCHAR NOT NULL,
    role team_role_enum NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_team_invitations_token ON team_invitations (token);

CREATE INDEX idx_team_invitations_team_email ON team_invitations (team_id, email);

CREATE INDEX idx_team_invitations_expires_at ON team_invitations (expires_at);

-- 5. songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams (id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    artist VARCHAR,
    key VARCHAR,
    bpm INTEGER,
    lyrics TEXT,
    notes TEXT,
    status song_status_enum NOT NULL DEFAULT 'published',
    created_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- XOR constraint: must belong to either user OR team, not both
    CONSTRAINT songs_owner_xor CHECK (
        (
            user_id IS NULL
            AND team_id IS NOT NULL
        )
        OR (
            user_id IS NOT NULL
            AND team_id IS NULL
        )
    )
);

CREATE INDEX idx_songs_user_id ON songs (user_id);

CREATE INDEX idx_songs_team_id ON songs (team_id);

CREATE INDEX idx_songs_status ON songs (status);

CREATE INDEX idx_songs_user_created ON songs (user_id, created_at);

CREATE INDEX idx_songs_team_created ON songs (team_id, created_at);

CREATE INDEX idx_songs_key ON songs (key);

-- 6. playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams (id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    date DATE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    share_code VARCHAR UNIQUE,
    share_expires_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- XOR constraint: must belong to either user OR team, not both
    CONSTRAINT playlists_owner_xor CHECK (
        (
            user_id IS NULL
            AND team_id IS NOT NULL
        )
        OR (
            user_id IS NOT NULL
            AND team_id IS NULL
        )
    ),
    -- If public, share_code must be set
    CONSTRAINT playlists_public_requires_share_code CHECK (
        (is_public = false)
        OR (share_code IS NOT NULL)
    )
);

CREATE INDEX idx_playlists_user_id ON playlists (user_id);

CREATE INDEX idx_playlists_team_id ON playlists (team_id);

CREATE UNIQUE INDEX idx_playlists_share_code ON playlists (share_code)
WHERE
    share_code IS NOT NULL;

CREATE INDEX idx_playlists_public_expires ON playlists (is_public, share_expires_at);

CREATE INDEX idx_playlists_created_at ON playlists (created_at);

-- 7. playlist_songs table
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    playlist_id UUID NOT NULL REFERENCES playlists (id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Prevent duplicate positions in same playlist
    UNIQUE (playlist_id, position),
    -- Prevent duplicate songs in same playlist
    UNIQUE (playlist_id, song_id)
);

CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs (playlist_id);

CREATE INDEX idx_playlist_songs_song_id ON playlist_songs (song_id);

CREATE UNIQUE INDEX idx_playlist_songs_playlist_position ON playlist_songs (playlist_id, position);

CREATE UNIQUE INDEX idx_playlist_songs_playlist_song ON playlist_songs (playlist_id, song_id);

CREATE INDEX idx_playlist_songs_ordered ON playlist_songs (playlist_id, position);

-- 8. activity_log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams (id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user_id ON activity_log (user_id);

CREATE INDEX idx_activity_log_team_id ON activity_log (team_id);

CREATE INDEX idx_activity_log_created_at ON activity_log (created_at);

CREATE INDEX idx_activity_log_team_created ON activity_log (team_id, created_at);

CREATE INDEX idx_activity_log_user_created ON activity_log (user_id, created_at);
-- GIN index for JSONB queries
CREATE INDEX idx_activity_log_metadata ON activity_log USING GIN (metadata);