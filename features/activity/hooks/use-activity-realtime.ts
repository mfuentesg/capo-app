/**
 * Real-time hook for activity feed
 * Subscribes to activity_log table changes
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { activityKeys } from "./query-keys"
import type { Tables } from "@/lib/supabase/database.types"

/**
 * Real-time hook for activity feed
 * Subscribes to activity_log table changes
 *
 * Note: Real-time subscription is ready but will only work when real data is available.
 * Currently using mock data, so this hook will set up the subscription but won't receive updates.
 */
export function useActivityRealtime() {
  const { data: user } = useUser()
  const { context } = useAppContext()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id || !context) return

    const supabase = createClient()
    const channelContextKey =
      context.type === "team" ? `team:${context.teamId}` : `personal:${user.id}`
    const channelName = `activity:${channelContextKey}`
    const filter =
      context.type === "team" ? `team_id=eq.${context.teamId}` : `user_id=eq.${user.id}`

    const channel = supabase
      .channel(channelName)
      .on<Tables<"activity_log">>(
        "postgres_changes",
        {
          event: "INSERT", // Only new activities
          schema: "public",
          table: "activity_log",
          filter
        },
        () => {
          // Invalidate activity feed query when new activity is inserted
          queryClient.invalidateQueries({
            queryKey: activityKeys.list(context)
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [context, queryClient, user?.id])
}
