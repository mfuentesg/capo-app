-- Allow unauthenticated users to read songs that belong to a public playlist.
-- This enables the /shared/[shareCode] page to display songs without login.
CREATE POLICY "Anyone can read songs in public playlists"
  ON songs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM playlist_songs ps
      JOIN playlists p ON p.id = ps.playlist_id
      WHERE ps.song_id = songs.id
        AND p.is_public = true
    )
  );
