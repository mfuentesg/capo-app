"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import {
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  getSongsByIds
} from "@/features/songs/api/songsApi"
import { songsKeys } from "@/features/songs/hooks/query-keys"
import { authKeys } from "@/lib/supabase/constants"
import type { Song } from "@/features/songs/types"
import type { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { useAppContext } from "@/features/app-context"

/**
 * Hook to fetch songs for the current context (personal or team)
 * Uses AppContext to determine if fetching personal or team songs
 */
export function useSongs() {
  const { context } = useAppContext()
  const { data: user } = useUser()

  return useQuery({
    queryKey: context ? songsKeys.list(context) : songsKeys.lists(),
    queryFn: async () => {
      if (!context) {
        return []
      }
      return getSongs(context)
    },
    enabled: !!context && !!user?.id
  })
}

/**
 * Hook to fetch a single song by ID
 */
export function useSong(songId: string | null) {
  return useQuery({
    queryKey: songsKeys.detail(songId || ""),
    queryFn: () => getSong(songId!),
    enabled: !!songId
  })
}

/**
 * Hook to fetch multiple songs by their IDs
 */
export function useSongsByIds(songIds: string[]) {
  return useQuery({
    queryKey: [...songsKeys.all, "byIds", songIds.sort().join(",")],
    queryFn: () => getSongsByIds(songIds),
    enabled: songIds.length > 0
  })
}

/**
 * Hook to create a new song
 */
export function useCreateSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async (song: Partial<Song>) => {
      // Get session from query cache at mutation time (not closure time)
      const session = queryClient.getQueryData<Session | null>(authKeys.session())

      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }
      return createSong(song, session.user.id)
    },
    onSuccess: (newSong) => {
      // Invalidate songs list query based on current context
      if (context) {
        queryClient.invalidateQueries({
          queryKey: songsKeys.list(context)
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: songsKeys.lists()
        })
      }
      // Add new song to cache
      queryClient.setQueryData(songsKeys.detail(newSong.id), newSong)
      toast.success(t.toasts?.songCreated || "Song created")
    },
    onError: (error) => {
      console.error("Error creating song:", error)
      toast.error(t.toasts?.error || "Failed to create song")
    }
  })
}

/**
 * Hook to update a song
 */
export function useUpdateSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: Partial<Song> }) => {
      return updateSong(songId, updates)
    },
    onSuccess: (updatedSong) => {
      // Invalidate songs list query
      queryClient.invalidateQueries({
        queryKey: songsKeys.lists()
      })
      // Update song detail in cache
      queryClient.setQueryData(songsKeys.detail(updatedSong.id), updatedSong)
      toast.success(t.toasts?.songUpdated || "Song updated")
    },
    onError: (error) => {
      console.error("Error updating song:", error)
      toast.error(t.toasts?.error || "Failed to update song")
    }
  })
}

/**
 * Hook to delete a song
 */
export function useDeleteSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async (songId: string) => {
      return deleteSong(songId)
    },
    onSuccess: (_, songId) => {
      // Invalidate songs list query
      queryClient.invalidateQueries({
        queryKey: songsKeys.lists()
      })
      // Remove song from cache
      queryClient.removeQueries({
        queryKey: songsKeys.detail(songId)
      })
      toast.success(t.toasts?.songDeleted || "Song deleted")
    },
    onError: (error) => {
      console.error("Error deleting song:", error)
      toast.error(t.toasts?.error || "Failed to delete song")
    }
  })
}
