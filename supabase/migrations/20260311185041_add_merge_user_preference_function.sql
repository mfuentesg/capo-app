-- Function to merge a single key into the profiles.preferences JSONB without overwriting other keys.
-- Used by setLocaleAction and setThemeAction to persist locale/theme without clobbering lyricsColumns.
CREATE OR REPLACE FUNCTION merge_user_preference(
  p_user_id UUID,
  p_key TEXT,
  p_value TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET preferences = jsonb_set(
    COALESCE(preferences, '{}'::jsonb),
    ARRAY[p_key],
    to_jsonb(p_value),
    true
  )
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION merge_user_preference(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION merge_user_preference(UUID, TEXT, TEXT) TO authenticated;
