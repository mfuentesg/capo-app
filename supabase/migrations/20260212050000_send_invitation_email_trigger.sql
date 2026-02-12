-- Migration: Add trigger to send invitation emails
-- Automatically sends an email when a team invitation is created

-- Enable pg_net extension for async HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send invitation email via Edge Function
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

  -- Construct the Edge Function URL
  -- In production: https://your-project-ref.supabase.co/functions/v1/user-team-invite
  -- In local dev: http://host.docker.internal:54321/functions/v1/user-team-invite
  -- The URL can be set via database settings
  BEGIN
    function_url := current_setting('app.edge_function_url', true);
  EXCEPTION WHEN OTHERS THEN
    function_url := NULL;
  END;

  -- Default to local development URL if not set
  IF function_url IS NULL OR function_url = '' THEN
    function_url := 'http://host.docker.internal:54321/functions/v1/user-team-invite';
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

-- Create trigger to send email after invitation is created
CREATE TRIGGER send_invitation_email_trigger
  AFTER INSERT ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION send_invitation_email();

-- Add helpful comment
COMMENT ON FUNCTION send_invitation_email () IS 'Automatically sends invitation email via Edge Function when a new team invitation is created';

COMMENT ON TRIGGER send_invitation_email_trigger ON team_invitations IS 'Triggers email sending when a new team invitation is inserted';