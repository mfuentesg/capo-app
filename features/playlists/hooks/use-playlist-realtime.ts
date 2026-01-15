/**
 * Real-time hook for playlist collaboration
 * Subscribes to changes in playlist_songs table
 *
 * TODO: Implement when real-time features are needed
 */

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Real-time hook for playlist collaboration
 * Subscribes to changes in playlist_songs table
 *
 * @param playlistId - Playlist UUID to subscribe to
 * @returns { isConnected } - Connection status
 */
export function usePlaylistRealtime(playlistId: string) {
  const queryClient = useQueryClient()
  const [isConnected] = useState(false)

  useEffect(() => {
    if (!playlistId) return

    // TODO: Implement real-time subscription
    // const supabase = createClient()
    // const channelName = `playlist:${playlistId}`
    //
    // const channel = supabase
    //   .channel(channelName)
    //   .on<PlaylistSong>(
    //     "postgres_changes",
    //     {
    //       event: "*", // INSERT, UPDATE, DELETE
    //       schema: "public",
    //       table: "playlist_songs",
    //       filter: `playlist_id=eq.${playlistId}`,
    //     },
    //     (payload: RealtimePostgresChangesPayload<PlaylistSong>) => {
    //       // Invalidate query to refetch updated playlist
    //       queryClient.invalidateQueries({
    //         queryKey: playlistsKeys.detail(playlistId),
    //       })
    //
    //       // Optional: Handle specific events
    //       // if (payload.eventType === "INSERT") {
    //       //   // Handle new song added
    //       // } else if (payload.eventType === "UPDATE") {
    //       //   // Handle song position changed
    //       // } else if (payload.eventType === "DELETE") {
    //       //   // Handle song removed
    //       // }
    //     }
    //   )
    //   .subscribe((status) => {
    //     setIsConnected(status === "SUBSCRIBED")
    //   })
    //
    // return () => {
    //   channel.unsubscribe()
    //   setIsConnected(false)
    // }
  }, [playlistId, queryClient])

  return { isConnected }
}
