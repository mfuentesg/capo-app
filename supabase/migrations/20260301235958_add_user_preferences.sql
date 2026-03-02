ALTER TABLE profiles
  ADD COLUMN preferences JSONB NOT NULL DEFAULT '{}';

-- Change FK to profiles so PostgREST can resolve the relationship for nested selects,
-- consistent with how songs, playlists, and team_members already reference profiles.
ALTER TABLE user_song_settings
  DROP CONSTRAINT user_song_settings_user_id_fkey,
  ADD CONSTRAINT user_song_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
