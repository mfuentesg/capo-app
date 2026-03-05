-- Finalize lyrics view by removing the minimalist view preference (now the default and only view)
-- and enable realtime sync for songs and user_song_settings.

-- 1. Remove minimalistLyricsView from all profiles' preferences JSON
UPDATE profiles
SET preferences = preferences - 'minimalistLyricsView'
WHERE preferences ? 'minimalistLyricsView';

-- 2. Enable Supabase Realtime for songs and user_song_settings tables.
-- Clients can now subscribe to live changes via postgres_changes events.
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE user_song_settings;
