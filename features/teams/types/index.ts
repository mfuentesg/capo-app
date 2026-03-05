import type { Tables } from "@/lib/supabase/database.types"

/**
 * Teams types
 *
 * Most types come from database.types.ts
 */
export type {} from "@/lib/supabase/database.types"

export interface PendingInvitation extends Tables<"team_invitations"> {
  teamName?: string
  inviterName?: string
}
