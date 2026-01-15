/**
 * Activity API - Types and functions for activity log
 * Based on database structure: activity_log table
 */

import type { Tables } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * TODO: Replace with real Supabase query when ready
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- context parameter kept for API compatibility
export async function getActivities(_context: AppContext): Promise<Activity[]> {
  // TODO: Implement real Supabase query
  // const supabase = createClient()
  // let query = supabase.from("activity_log").select("*")
  // if (context.type === "personal") {
  //   query = query.eq("user_id", context.userId)
  // } else {
  //   query = query.eq("team_id", context.teamId)
  // }
  // const { data, error } = await query
  //   .order("created_at", { ascending: false })
  //   .limit(limit)
  // if (error) throw error
  // return (data || []).map(mapDBActivityToFrontend)

  return []
}
