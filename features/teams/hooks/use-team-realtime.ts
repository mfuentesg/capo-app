/**
 * Real-time hook for team activity
 * Subscribes to team-related changes
 * 
 * TODO: Implement when real-time team features are needed
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { teamsKeys } from "./query-keys"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Team = Database["public"]["Tables"]["teams"]["Row"]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]

/**
 * Real-time hook for team activity
 * Subscribes to team-related changes
 * 
 * @param teamId - Team UUID to subscribe to
 */
export function useTeamRealtime(teamId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!teamId) return

    // TODO: Implement real-time subscription
    // const supabase = createClient()
    // const channelName = `team:${teamId}`
    // 
    // const channel = supabase
    //   .channel(channelName)
    //   .on<TeamMember>(
    //     "postgres_changes",
    //     {
    //       event: "*",
    //       schema: "public",
    //       table: "team_members",
    //       filter: `team_id=eq.${teamId}`,
    //     },
    //     (payload: RealtimePostgresChangesPayload<TeamMember>) => {
    //       queryClient.invalidateQueries({
    //         queryKey: teamsKeys.members(teamId),
    //       })
    //     }
    //   )
    //   .on<Team>(
    //     "postgres_changes",
    //     {
    //       event: "UPDATE",
    //       schema: "public",
    //       table: "teams",
    //       filter: `id=eq.${teamId}`,
    //     },
    //     (payload: RealtimePostgresChangesPayload<Team>) => {
    //       queryClient.invalidateQueries({
    //         queryKey: teamsKeys.detail(teamId),
    //       })
    //     }
    //   )
    //   .subscribe()
    // 
    // return () => {
    //   channel.unsubscribe()
    // }
  }, [teamId, queryClient])
}

