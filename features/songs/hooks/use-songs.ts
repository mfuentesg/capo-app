"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { api } from "@/features/songs"
import { createSongAction, updateSongAction, deleteSongAction } from "@/features/songs/api/actions"
import { songsKeys } from "@/features/songs/hooks/query-keys"
import type { Song } from "@/features/songs/types"
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
      return api.getSongs(context)
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
    queryFn: () => api.getSong(songId!),
    enabled: !!songId
  })
}

/**
 * Hook to fetch multiple songs by their IDs
 */
export function useSongsByIds(songIds: string[]) {
  return useQuery({
    queryKey: [...songsKeys.all, "byIds", songIds.sort().join(",")],
    queryFn: () => api.getSongsByIds(songIds),
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
    mutationFn: async ({ song, userId }: { song: Partial<Song>; userId: string }) => {
      return createSongAction(song, userId)
    },
    onSuccess: (newSong) => {
      const song = newSong
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
      queryClient.setQueryData(songsKeys.detail(song.id), song)
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
      return updateSongAction(songId, updates)
    },
    onSuccess: (updatedSong) => {
      const song = updatedSong
      // Invalidate songs list query
      queryClient.invalidateQueries({
        queryKey: songsKeys.lists()
      })
      // Update song detail in cache
      queryClient.setQueryData(songsKeys.detail(song.id), song)
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
      return deleteSongAction(songId)
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
