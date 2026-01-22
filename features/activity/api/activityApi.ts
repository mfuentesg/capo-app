/**
 * Activity API - Types and functions for activity log
 * Based on database structure: activity_log table
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type { Tables } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import { applyContextFilter } from "@/lib/supabase/apply-context-filter"

export type ActivityLog = Tables<"activity_log">

export interface Activity {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  userId: string | null
  teamId: string | null
  createdAt: string
}

function mapDBActivityToFrontend(dbActivity: ActivityLog): Activity {
  return {
    id: dbActivity.id,
    action: dbActivity.action,
    entityType: dbActivity.entity_type,
    entityId: dbActivity.entity_id,
    metadata: dbActivity.metadata as Record<string, unknown> | null,
    userId: dbActivity.user_id,
    teamId: dbActivity.team_id,
    createdAt: dbActivity.created_at
  }
}

/**
 * Fetch activities based on context (personal or team)
 */
export async function getActivities(
  supabase: SupabaseClient<Database>,
  context: AppContext,
  limit = 10
): Promise<Activity[]> {
  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  query = applyContextFilter(query, context)

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapDBActivityToFrontend)
}
