"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { api } from "../api"
import {
  getSongsAction,
  createSongAction,
  updateSongAction,
  deleteSongAction
} from "../api/actions"
import { songsKeys } from "./query-keys"
import type { Song } from "../types"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { useAppContext } from "@/features/app-context"

type SongQuerySnapshot = Array<[readonly unknown[], Song[] | undefined]>

function snapshotSongQueries(queryClient: ReturnType<typeof useQueryClient>): SongQuerySnapshot {
  return queryClient.getQueriesData<Song[]>({ queryKey: songsKeys.lists() })
}

function restoreSongQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots?: SongQuerySnapshot
) {
  if (!snapshots) return

  for (const [queryKey, data] of snapshots) {
    queryClient.setQueryData(queryKey, data)
  }
}

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
      return getSongsAction(context)
    },
    enabled: !!context && !!user?.id,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData
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
    queryKey: [...songsKeys.all, "byIds", [...songIds].sort().join(",")],
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
      return createSongAction(song, userId, context ?? undefined)
    },
    onSuccess: (newSong) => {
      const song = newSong
      queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
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

  return useMutation({
    mutationFn: async ({ songId, updates }: { songId: string; updates: Partial<Song> }) => {
      return updateSongAction(songId, updates)
    },
    onMutate: async ({ songId, updates }) => {
      await queryClient.cancelQueries({ queryKey: songsKeys.lists() })
      const snapshots = snapshotSongQueries(queryClient)
      queryClient.setQueriesData<Song[]>({ queryKey: songsKeys.lists() }, (old) =>
        old?.map((s) => (s.id === songId ? { ...s, ...updates } : s))
      )
      // Also update detail cache
      const previousDetail = queryClient.getQueryData<Song>(songsKeys.detail(songId))
      if (previousDetail) {
        queryClient.setQueryData(songsKeys.detail(songId), { ...previousDetail, ...updates })
      }
      return { snapshots, previousDetail }
    },
    onError: (_err, { songId }, rollbackContext) => {
      restoreSongQueries(queryClient, rollbackContext?.snapshots)
      if (rollbackContext?.previousDetail) {
        queryClient.setQueryData(songsKeys.detail(songId), rollbackContext.previousDetail)
      }
      toast.error(t.toasts?.error || "Failed to update song")
    },
    onSuccess: (updatedSong) => {
      queryClient.setQueriesData<Song[]>({ queryKey: songsKeys.lists() }, (old) =>
        old?.map((s) => (s.id === updatedSong.id ? { ...s, ...updatedSong } : s))
      )
      queryClient.setQueryData(songsKeys.detail(updatedSong.id), updatedSong)
      toast.success(t.toasts?.songUpdated || "Song updated")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
    }
  })
}

/**
 * Hook to delete a song with optimistic updates
 */
export function useDeleteSong() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async (songId: string) => {
      return deleteSongAction(songId)
    },
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: songsKeys.lists() })
      const snapshots = snapshotSongQueries(queryClient)
      queryClient.setQueriesData<Song[]>({ queryKey: songsKeys.lists() }, (old) =>
        old?.filter((s) => s.id !== songId)
      )
      return { snapshots }
    },
    onError: (_err, _songId, rollbackContext) => {
      restoreSongQueries(queryClient, rollbackContext?.snapshots)
      toast.error(t.toasts?.error || "Failed to delete song")
    },
    onSuccess: (_, songId) => {
      queryClient.removeQueries({ queryKey: songsKeys.detail(songId) })
      toast.success(t.toasts?.songDeleted || "Song deleted")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: songsKeys.lists() })
    }
  })
}
