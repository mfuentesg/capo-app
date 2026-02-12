-- Migration: Add cron job to delete expired team invitations

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION delete_expired_team_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
	DELETE FROM team_invitations
	WHERE expires_at < now();
END;
$$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM cron.job
		WHERE jobname = 'delete-expired-team-invitations-hourly'
	) THEN
		PERFORM cron.unschedule('delete-expired-team-invitations-hourly');
	END IF;
END $$;

SELECT cron.schedule (
        'delete-expired-team-invitations-hourly', '0 * * * *', 'select delete_expired_team_invitations()'
    );