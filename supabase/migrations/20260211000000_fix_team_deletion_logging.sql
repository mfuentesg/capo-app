-- Migration: Fix team deletion logging
-- Issue: When deleting a team, the log_activity trigger tries to INSERT into activity_log 
-- with a team_id foreign key reference that no longer exists, violating the foreign key constraint.
-- 
-- Solution: Set team_id to NULL when logging team deletions to avoid the foreign key violation.
-- Team deletion is still logged, but with team_id = NULL since the team no longer exists.

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_name TEXT;
  entity_type_name TEXT;
  entity_id_val UUID;
  user_id_val UUID;
  team_id_val UUID;
  metadata_val JSONB;
BEGIN
  -- Determine action and entity type based on table
  IF TG_TABLE_NAME = 'songs' THEN
    entity_type_name := 'song';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.user_id, OLD.user_id);
    team_id_val := COALESCE(NEW.team_id, OLD.team_id);

    IF TG_OP = 'INSERT' THEN
      action_name := 'song_created';
      metadata_val := jsonb_build_object('title', NEW.title);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'song_updated';
      metadata_val := jsonb_build_object(
        'title', NEW.title,
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'song_deleted';
      metadata_val := jsonb_build_object('title', OLD.title);
    END IF;

  ELSIF TG_TABLE_NAME = 'playlists' THEN
    entity_type_name := 'playlist';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.user_id, OLD.user_id);
    team_id_val := COALESCE(NEW.team_id, OLD.team_id);

    IF TG_OP = 'INSERT' THEN
      action_name := 'playlist_created';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'playlist_updated';
      metadata_val := jsonb_build_object(
        'name', NEW.name,
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(to_jsonb(NEW))
          WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'playlist_deleted';
      metadata_val := jsonb_build_object('name', OLD.name);
    END IF;

  ELSIF TG_TABLE_NAME = 'teams' THEN
    entity_type_name := 'team';
    entity_id_val := COALESCE(NEW.id, OLD.id);
    user_id_val := COALESCE(NEW.created_by, OLD.created_by);
    -- IMPORTANT: For team deletions, set team_id to NULL to avoid foreign key violation
    -- The team record no longer exists, so we can't reference it
    IF TG_OP = 'DELETE' THEN
      team_id_val := NULL;
    ELSE
      team_id_val := COALESCE(NEW.id, OLD.id);
    END IF;

    IF TG_OP = 'INSERT' THEN
      action_name := 'team_created';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
      action_name := 'team_updated';
      metadata_val := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'DELETE' THEN
      action_name := 'team_deleted';
      metadata_val := jsonb_build_object('name', OLD.name, 'team_id', OLD.id);
    END IF;
  END IF;

  -- Insert activity log
  INSERT INTO activity_log (user_id, team_id, action, entity_type, entity_id, metadata)
  VALUES (user_id_val, team_id_val, action_name, entity_type_name, entity_id_val, metadata_val);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
