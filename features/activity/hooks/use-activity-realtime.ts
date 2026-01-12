/**
 * Real-time hook for activity feed
 * Subscribes to activity_log table changes
 *
 * Currently set up for personal context (user_id filtering)
 * TODO: Add team context support when AppContext is implemented
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/features/auth"
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
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()
    const channelName = `activity:${user.id}`

    const channel = supabase
      .channel(channelName)
      .on<Tables<"activity_log">>(
        "postgres_changes",
        {
          event: "INSERT", // Only new activities
          schema: "public",
          table: "activity_log",
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate activity feed query when new activity is inserted
          queryClient.invalidateQueries({
            queryKey: activityKeys.list({ type: "personal", userId: user.id })
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id, queryClient])
}
