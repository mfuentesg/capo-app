-- Migration: Fix Edge Function URL default for production
--
-- Problem: The send_invitation_email trigger defaults to
-- http://host.docker.internal:54321/functions/v1/user-team-invite
-- which only works in local Docker development.
-- In production, app.edge_function_url GUC is null and can't be
-- set via ALTER DATABASE/ROLE on Supabase hosted.
--
-- Fix: Flip the default to the production Edge Function URL.
-- Local development overrides via supabase/config.toml [db.settings].

CREATE OR REPLACE FUNCTION send_invitation_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_name_var TEXT;
  inviter_name_var TEXT;
  role_str TEXT;
  function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Get team name
  SELECT teams.name INTO team_name_var
  FROM teams
  WHERE teams.id = NEW.team_id;

  -- Get inviter name
  SELECT COALESCE(profiles.full_name, profiles.email, 'A team member') INTO inviter_name_var
  FROM profiles
  WHERE profiles.id = NEW.invited_by;

  -- Convert role enum to string
  role_str := NEW.role::TEXT;

  -- Resolve Edge Function URL:
  -- 1. Check for explicit GUC override (set via config.toml in local dev)
  -- 2. Fall back to production Supabase Edge Function URL
  BEGIN
    function_url := current_setting('app.edge_function_url', true);
  EXCEPTION WHEN OTHERS THEN
    function_url := NULL;
  END;

  IF function_url IS NULL OR function_url = '' THEN
    function_url := 'https://pcuocoecweajvdbqsdsu.supabase.co/functions/v1/user-team-invite';
  END IF;

  -- Make async HTTP request to Edge Function using pg_net
  -- pg_net runs async, so this won't block the invitation creation
  SELECT INTO request_id
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'to', NEW.email,
        'teamName', team_name_var,
        'inviterName', inviter_name_var,
        'token', NEW.token,
        'role', role_str
      )
    );

  -- Log the request (optional, for debugging)
  RAISE LOG 'Invitation email queued for % (team: %, token: %): request_id=%',
    NEW.email, team_name_var, NEW.token, request_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the invitation creation if email sending fails
  RAISE WARNING 'Failed to queue invitation email for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;