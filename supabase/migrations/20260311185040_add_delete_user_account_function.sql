-- delete_user_account: permanently deletes a user and all their data.
--
-- Deleting from auth.users cascades to profiles, which cascades to songs,
-- playlists, teams (created_by), team_members, user_song_settings, and
-- all other child rows via FK ON DELETE CASCADE constraints.
--
-- SECURITY DEFINER is required to delete from auth.users (which is otherwise
-- restricted to the service_role).  The SET search_path clause prevents
-- search_path injection attacks.

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: Ensure the caller is deleting their own account
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Only authenticated, signed-in users may call this function (they can only
-- delete their own account because the server action verifies the calling
-- user's session before invoking this RPC).
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;
