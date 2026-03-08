-- Enable Supabase Realtime for activity_log table.
-- useActivityRealtime subscribes to INSERT events on this table but it was
-- never added to the publication, causing the subscription to silently receive
-- no events. Clients can now subscribe to live changes via postgres_changes events.
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
