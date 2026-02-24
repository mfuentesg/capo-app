-- Backfill share codes for existing playlists that don't have one.
-- Uses uppercase alphanumeric characters (A-Z, 0-9) for consistency with the app.

CREATE OR REPLACE FUNCTION generate_share_code(length integer DEFAULT 12)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars))::integer + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

UPDATE playlists
SET share_code = generate_share_code()
WHERE share_code IS NULL;

DROP FUNCTION generate_share_code(integer);
