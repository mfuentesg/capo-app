/**
 * Combined real-time hook for playlist collaboration
 * Handles both data changes and presence
 *
 * TODO: Implement when collaboration features are needed
 */

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/features/auth"
import { playlistsKeys } from "./query-keys"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

type PlaylistSong = Database["public"]["Tables"]["playlist_songs"]["Row"]

interface PresenceUser {
  user_id: string
  user_name: string
  avatar_url?: string
}

/**
 * Combined real-time hook for playlist collaboration
 * Handles both data changes and presence
 *
 * @param playlistId - Playlist UUID to collaborate on
 * @returns { isConnected, activeUsers, activeUserCount } - Collaboration state
 */
export function usePlaylistCollaboration(playlistId: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!playlistId || !session?.user) return

    // TODO: Implement combined real-time subscription
    // const supabase = createClient()
    // const channelName = `playlist:collab:${playlistId}`
    //
    // const channel = supabase.channel(channelName, {
    //   config: {
    //     presence: {
    //       key: session.user.id,
    //     },
    //   },
    // })
    //
    // // Subscribe to data changes
    // channel.on<PlaylistSong>(
    //   "postgres_changes",
    //   {
    //     event: "*",
    //     schema: "public",
    //     table: "playlist_songs",
    //     filter: `playlist_id=eq.${playlistId}`,
    //   },
    //   (payload: RealtimePostgresChangesPayload<PlaylistSong>) => {
    //     queryClient.invalidateQueries({
    //       queryKey: playlistsKeys.detail(playlistId),
    //     })
    //   }
    // )
    //
    // // Subscribe to presence changes
    // channel
    //   .on("presence", { event: "sync" }, () => {
    //     const state = channel.presenceState<PresenceUser>()
    //     const users = Object.values(state)
    //       .flat()
    //       .map((presence) => presence as PresenceUser)
    //     setActiveUsers(users.filter((u) => u.user_id !== session.user.id))
    //   })
    //   .on("presence", { event: "join" }, ({ newPresences }) => {
    //     const newUsers = newPresences as PresenceUser[]
    //     setActiveUsers((prev) => [...prev, ...newUsers])
    //   })
    //   .on("presence", { event: "leave" }, ({ leftPresences }) => {
    //     const leftUsers = leftPresences as PresenceUser[]
    //     setActiveUsers((prev) =>
    //       prev.filter((user) => !leftUsers.some((left) => left.user_id === user.user_id))
    //     )
    //   })
    //   .subscribe(async (status) => {
    //     setIsConnected(status === "SUBSCRIBED")
    //
    //     if (status === "SUBSCRIBED") {
    //       // Track current user's presence
    //       await channel.track({
    //         user_id: session.user.id,
    //         user_name: session.user.user_metadata?.full_name || session.user.email || "User",
    //         avatar_url: session.user.user_metadata?.avatar_url,
    //       })
    //     }
    //   })
    //
    // return () => {
    //   channel.unsubscribe()
    //   setIsConnected(false)
    //   setActiveUsers([])
    // }
  }, [playlistId, session, queryClient])

  return {
    isConnected,
    activeUsers,
    activeUserCount: activeUsers.length
  }
}
