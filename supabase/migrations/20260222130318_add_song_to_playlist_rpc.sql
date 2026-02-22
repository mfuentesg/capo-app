CREATE OR REPLACE FUNCTION add_song_to_playlist(p_playlist_id uuid, p_song_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_position integer;
BEGIN
  SELECT COALESCE(MAX(position) + 1, 0)
  INTO next_position
  FROM playlist_songs
  WHERE playlist_id = p_playlist_id;

  INSERT INTO playlist_songs (playlist_id, song_id, position)
  VALUES (p_playlist_id, p_song_id, next_position)
  ON CONFLICT (playlist_id, song_id) DO NOTHING;
END;
$$;
