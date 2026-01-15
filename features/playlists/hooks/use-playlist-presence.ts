/**
 * Real-time presence hook - shows who's currently viewing a playlist
 *
 * TODO: Implement when presence features are needed
 */

import { useEffect, useState } from "react"
import { useUser } from "@/features/auth"

interface PresenceUser {
  user_id: string
  user_name: string
  avatar_url?: string
}

/**
 * Real-time presence hook - shows who's currently viewing a playlist
 *
 * @param playlistId - Playlist UUID to track presence for
 * @returns { activeUsers, count } - Active users and count
 */
export function usePlaylistPresence(playlistId: string) {
  const { data: user } = useUser()
  const [activeUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!playlistId || !user?.id) return

    // TODO: Implement presence tracking
    // const supabase = createClient()
    // const channelName = `playlist:presence:${playlistId}`
    //
    // const channel = supabase.channel(channelName, {
    //   config: {
    //     presence: {
    //       key: session.user.id,
    //     },
    //   },
    // })
    //
    // // Track current user's presence
    // channel
    //   .on("presence", { event: "sync" }, () => {
    //     const state = channel.presenceState<PresenceUser>()
    //     const users = Object.values(state)
    //       .flat()
    //       .map((presence) => presence as PresenceUser)
    //       .filter((user) => user.user_id !== session.user.id) // Exclude self
    //
    //     setActiveUsers(users)
    //   })
    //   .on("presence", { event: "join" }, ({ key, newPresences }) => {
    //     // User joined
    //     const newUsers = newPresences as PresenceUser[]
    //     setActiveUsers((prev) => [...prev, ...newUsers])
    //   })
    //   .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
    //     // User left
    //     const leftUsers = leftPresences as PresenceUser[]
    //     setActiveUsers((prev) =>
    //       prev.filter((user) => !leftUsers.some((left) => left.user_id === user.user_id))
    //     )
    //   })
    //   .subscribe(async (status) => {
    //     if (status === "SUBSCRIBED") {
    //       // Track current user
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
    //   setActiveUsers([])
    // }
  }, [playlistId, user?.id])

  return { activeUsers, count: activeUsers.length }
}
