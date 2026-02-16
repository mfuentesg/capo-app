"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPlaylistsAction,
  createPlaylistAction,
  updatePlaylistAction,
  deletePlaylistAction,
  reorderPlaylistSongsAction
} from "../api/actions"
import { playlistsKeys } from "./query-keys"
import type { Playlist } from "../types"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { useAppContext } from "@/features/app-context"

type PlaylistQuerySnapshot = Array<[readonly unknown[], Playlist[] | undefined]>

function snapshotPlaylistQueries(queryClient: ReturnType<typeof useQueryClient>): PlaylistQuerySnapshot {
  return queryClient.getQueriesData<Playlist[]>({ queryKey: playlistsKeys.lists() })
}

function restorePlaylistQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots?: PlaylistQuerySnapshot
) {
  if (!snapshots) return

  for (const [queryKey, data] of snapshots) {
    queryClient.setQueryData(queryKey, data)
  }
}

/**
 * Hook to fetch playlists for the current context (personal or team)
 */
export function usePlaylists() {
  const { context } = useAppContext()

  return useQuery({
    queryKey: context ? playlistsKeys.list(context) : playlistsKeys.lists(),
    queryFn: async () => {
      if (!context) {
        return []
      }
      return getPlaylistsAction(context)
    },
    enabled: !!context,
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData
  })
}

/**
 * Hook to create a new playlist
 */
export function useCreatePlaylist() {
  const queryClient = useQueryClient()
  const { t } = useLocale()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async ({ playlist, userId }: { playlist: Playlist; userId: string }) => {
      return createPlaylistAction(playlist, userId, context ?? undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      toast.success(t.toasts?.playlistCreated || "Playlist created")
    },
    onError: (error) => {
      console.error("Error creating playlist:", error)
      toast.error(t.toasts?.error || "Something went wrong")
    }
  })
}

/**
 * Hook to update a playlist with optimistic updates
 */
export function useUpdatePlaylist() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({
      playlistId,
      updates
    }: {
      playlistId: string
      updates: Partial<Playlist>
    }) => {
      return updatePlaylistAction(playlistId, updates)
    },
    onMutate: async ({ playlistId, updates }) => {
      await queryClient.cancelQueries({ queryKey: playlistsKeys.lists() })
      const snapshots = snapshotPlaylistQueries(queryClient)
      queryClient.setQueriesData<Playlist[]>({ queryKey: playlistsKeys.lists() }, (old) =>
        old?.map((p) => (p.id === playlistId ? { ...p, ...updates } : p))
      )
      return { snapshots }
    },
    onError: (_err, _vars, rollbackContext) => {
      restorePlaylistQueries(queryClient, rollbackContext?.snapshots)
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: (updatedPlaylist) => {
      queryClient.setQueriesData<Playlist[]>({ queryKey: playlistsKeys.lists() }, (old) =>
        old?.map((p) => (p.id === updatedPlaylist.id ? updatedPlaylist : p))
      )
      toast.success(t.toasts?.playlistUpdated || "Playlist updated")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
    }
  })
}

/**
 * Hook to delete a playlist with optimistic updates
 */
export function useDeletePlaylist() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async (playlistId: string) => {
      return deletePlaylistAction(playlistId)
    },
    onMutate: async (playlistId) => {
      await queryClient.cancelQueries({ queryKey: playlistsKeys.lists() })
      const snapshots = snapshotPlaylistQueries(queryClient)
      queryClient.setQueriesData<Playlist[]>({ queryKey: playlistsKeys.lists() }, (old) =>
        old?.filter((p) => p.id !== playlistId)
      )
      return { snapshots }
    },
    onError: (_err, _vars, rollbackContext) => {
      restorePlaylistQueries(queryClient, rollbackContext?.snapshots)
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: () => {
      toast.success(t.toasts?.playlistDeleted || "Playlist deleted")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
    }
  })
}

/**
 * Hook to reorder songs within a playlist
 */
export function useReorderPlaylistSongs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      playlistId,
      sourceIndex,
      destinationIndex,
      currentSongs
    }: {
      playlistId: string
      sourceIndex: number
      destinationIndex: number
      currentSongs: string[]
    }) => {
      const newSongs = Array.from(currentSongs)
      const [removed] = newSongs.splice(sourceIndex, 1)
      newSongs.splice(destinationIndex, 0, removed)

      const updates = newSongs.map((songId, position) => ({ songId, position }))
      return reorderPlaylistSongsAction(playlistId, updates)
    },
    onMutate: async ({ playlistId, sourceIndex, destinationIndex, currentSongs }) => {
      await queryClient.cancelQueries({ queryKey: playlistsKeys.lists() })
      const snapshots = snapshotPlaylistQueries(queryClient)
      const newSongs = Array.from(currentSongs)
      const [removed] = newSongs.splice(sourceIndex, 1)
      newSongs.splice(destinationIndex, 0, removed)

      queryClient.setQueriesData<Playlist[]>({ queryKey: playlistsKeys.lists() }, (old) =>
        old?.map((p) => {
          if (p.id !== playlistId) return p
          return { ...p, songs: newSongs }
        })
      )

      return { snapshots }
    },
    onError: (_err, _vars, rollbackContext) => {
      restorePlaylistQueries(queryClient, rollbackContext?.snapshots)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
    }
  })
}
