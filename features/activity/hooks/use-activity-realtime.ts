/**
 * Real-time hook for activity feed
 * Subscribes to activity_log table changes
 * 
 * TODO: Implement when real-time activity features are needed
 */

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
// TODO: Import when AppContext is implemented
// import { useAppContext } from "@/features/app-context"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { activityKeys } from "./query-keys"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
 
import type { Database } from "@/lib/supabase/database.types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"]

/**
 * Real-time hook for activity feed
 * Subscribes to activity_log table changes
 */
export function useActivityRealtime() {
  // TODO: Get context when AppContext is implemented
  // const { context } = useAppContext()
  const queryClient = useQueryClient()

  useEffect(() => {
    // TODO: Uncomment when AppContext is available
    // if (!context) return
    return

    // TODO: Implement real-time subscription
    // const supabase = createClient()
    // const channelName = `activity:${context.type === "personal" ? context.userId : context.teamId}`
    // 
    // let filter = ""
    // if (context.type === "personal") {
    //   filter = `user_id=eq.${context.userId}`
    // } else {
    //   filter = `team_id=eq.${context.teamId}`
    // }
    // 
    // const channel = supabase
    //   .channel(channelName)
    //   .on<ActivityLog>(
    //     "postgres_changes",
    //     {
    //       event: "INSERT", // Only new activities
    //       schema: "public",
    //       table: "activity_log",
    //       filter,
    //     },
    //     (payload: RealtimePostgresChangesPayload<ActivityLog>) => {
    //       // Invalidate activity feed query
    //       queryClient.invalidateQueries({
    //         queryKey: activityKeys.list(context),
    //       })
    //     }
    //   )
    //   .subscribe()
    // 
    // return () => {
    //   channel.unsubscribe()
    // }
  }, [queryClient]) // TODO: Add context to dependencies when available
}

