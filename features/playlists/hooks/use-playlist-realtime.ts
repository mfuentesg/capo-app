"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { playlistsKeys } from "./query-keys"

/**
 * Real-time hook for playlist collaboration (dashboard view)
 * Subscribes to playlist_songs changes and invalidates the React Query detail cache.
 *
 * @param playlistId - Playlist UUID to subscribe to
 * @returns { isConnected } - Whether the channel is subscribed
 */
export function usePlaylistRealtime(playlistId: string) {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!playlistId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`playlist:${playlistId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playlist_songs",
          filter: `playlist_id=eq.${playlistId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: playlistsKeys.detail(playlistId) })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      channel.unsubscribe()
      setIsConnected(false)
    }
  }, [playlistId, queryClient])

  return { isConnected }
}
