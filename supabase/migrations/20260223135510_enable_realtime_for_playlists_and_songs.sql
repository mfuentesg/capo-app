-- Enable Supabase Realtime for playlist data tables.
-- Clients can now subscribe to live changes via postgres_changes events.
ALTER PUBLICATION supabase_realtime ADD TABLE playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE playlist_songs;
