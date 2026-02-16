-- Fix broken share-code generation function and add guest editing persistence.

ALTER TABLE playlists
ADD COLUMN IF NOT EXISTS allow_guest_editing BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION ensure_share_code(playlist_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code TEXT;
  playlist_record playlists%ROWTYPE;
BEGIN
  SELECT * INTO playlist_record
  FROM playlists
  WHERE id = playlist_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Playlist not found';
  END IF;

  IF playlist_record.share_code IS NOT NULL THEN
    RETURN playlist_record.share_code;
  END IF;

  LOOP
    generated_code := encode(extensions.gen_random_bytes(9), 'base64');
    generated_code := translate(generated_code, '+/', '-_');
    generated_code := substring(generated_code from 1 for 12);

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM playlists
      WHERE share_code = generated_code
    );
  END LOOP;

  UPDATE playlists
  SET share_code = generated_code
  WHERE id = playlist_id;

  RETURN generated_code;
END;
$$;
