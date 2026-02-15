"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { api } from "../api"
import { createSongAction, updateSongAction, deleteSongAction } from "../api/actions"
import { songsKeys } from "./query-keys"
import type { Song } from "../types"
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
 * Hook to update a song with optimistic updates
 */
export function useUpdateSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: Partial<Song> }) => {
      return updateSongAction(songId, updates)
    },
    onMutate: async ({ songId, updates }) => {
      const queryKey = context ? songsKeys.list(context) : songsKeys.lists()
      await queryClient.cancelQueries({ queryKey })
      const previousSongs = queryClient.getQueryData<Song[]>(queryKey)
      queryClient.setQueryData<Song[]>(
        queryKey,
        (old) => old?.map((s) => (s.id === songId ? { ...s, ...updates } : s)) ?? []
      )
      // Also update detail cache
      const previousDetail = queryClient.getQueryData<Song>(songsKeys.detail(songId))
      if (previousDetail) {
        queryClient.setQueryData(songsKeys.detail(songId), { ...previousDetail, ...updates })
      }
      return { previousSongs, previousDetail, queryKey }
    },
    onError: (_err, { songId }, rollbackContext) => {
      if (rollbackContext?.previousSongs) {
        queryClient.setQueryData(rollbackContext.queryKey, rollbackContext.previousSongs)
      }
      if (rollbackContext?.previousDetail) {
        queryClient.setQueryData(songsKeys.detail(songId), rollbackContext.previousDetail)
      }
      toast.error(t.toasts?.error || "Failed to update song")
    },
    onSuccess: (updatedSong) => {
      queryClient.setQueryData(songsKeys.detail(updatedSong.id), updatedSong)
      toast.success(t.toasts?.songUpdated || "Song updated")
    },
    onSettled: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: songsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
      }
    }
  })
}

/**
 * Hook to delete a song with optimistic updates
 */
export function useDeleteSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async (songId: string) => {
      return deleteSongAction(songId)
    },
    onMutate: async (songId) => {
      const queryKey = context ? songsKeys.list(context) : songsKeys.lists()
      await queryClient.cancelQueries({ queryKey })
      const previousSongs = queryClient.getQueryData<Song[]>(queryKey)
      queryClient.setQueryData<Song[]>(
        queryKey,
        (old) => old?.filter((s) => s.id !== songId) ?? []
      )
      return { previousSongs, queryKey }
    },
    onError: (_err, _songId, rollbackContext) => {
      if (rollbackContext?.previousSongs) {
        queryClient.setQueryData(rollbackContext.queryKey, rollbackContext.previousSongs)
      }
      toast.error(t.toasts?.error || "Failed to delete song")
    },
    onSuccess: (_, songId) => {
      queryClient.removeQueries({ queryKey: songsKeys.detail(songId) })
      toast.success(t.toasts?.songDeleted || "Song deleted")
    },
    onSettled: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: songsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
      }
    }
  })
}
