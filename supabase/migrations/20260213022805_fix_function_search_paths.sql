-- Fix Function Search Path Mutable Security Issue
-- Adds SET search_path TO public to all functions to prevent schema hijacking vulnerabilities
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Helper functions (used in RLS policies)
ALTER FUNCTION is_team_member(UUID, UUID) SET search_path TO public;

ALTER FUNCTION get_team_role(UUID, UUID) SET search_path TO public;

ALTER FUNCTION has_team_permission(UUID, UUID, team_role_enum) SET search_path TO public;

-- Business logic functions (RPCs)
ALTER FUNCTION change_team_member_role(UUID, UUID, team_role_enum) SET search_path TO public;

ALTER FUNCTION accept_team_invitation(TEXT) SET search_path TO public;

ALTER FUNCTION transfer_team_ownership(UUID, UUID) SET search_path TO public;

ALTER FUNCTION ensure_share_code(UUID) SET search_path TO public;

ALTER FUNCTION cleanup_expired_shares() SET search_path TO public;

ALTER FUNCTION create_team_with_owner(TEXT, BOOLEAN, TEXT) SET search_path TO public;

ALTER FUNCTION invite_team_member(UUID, TEXT, team_role_enum) SET search_path TO public;

ALTER FUNCTION remove_team_member(UUID, UUID) SET search_path TO public;

ALTER FUNCTION leave_team(UUID) SET search_path TO public;

-- Trigger functions
ALTER FUNCTION update_updated_at_column() SET search_path TO public;

ALTER FUNCTION add_owner_as_member() SET search_path TO public;

ALTER FUNCTION log_activity() SET search_path TO public;

ALTER FUNCTION auto_ensure_share_code() SET search_path TO public;