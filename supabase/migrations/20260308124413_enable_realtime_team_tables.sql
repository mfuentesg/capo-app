-- Enable Supabase Realtime for team_members and teams tables.
-- useTeamRealtime (currently stubbed) subscribes to these tables.
-- Adding them now so the hook works correctly when it is activated.
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
