/**
 * Real-time hook for team activity
 * Subscribes to team-related changes
 *
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

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

    // Real-time subscription implementation
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
