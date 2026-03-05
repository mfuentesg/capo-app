"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { songsKeys } from "./query-keys"

/**
 * Real-time hook for a single song.
 * Subscribes to changes in the 'songs' and 'user_song_settings' tables
 * and invalidates the corresponding React Query caches.
 *
 * @param songId - Song UUID to subscribe to
 */
export function useSongRealtime(songId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!songId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`song:${songId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs",
          filter: `id=eq.${songId}`
        },
        () => {
          // Invalidate the song detail query
          // Note: The specific key might depend on how songs are fetched,
          // but usually this would invalidate any song list or detail query.
          queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
          // If there's a specific song detail key, it should be used here.
          // In this app, song detail is often passed as initial data or fetched via api.getSong.
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_song_settings",
          filter: `song_id=eq.${songId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: songsKeys.userSettings(songId) })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [songId, queryClient])
}
