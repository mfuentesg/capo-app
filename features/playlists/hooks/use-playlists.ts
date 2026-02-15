"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import { createPlaylistAction, updatePlaylistAction, deletePlaylistAction } from "../api/actions"
import { playlistsKeys } from "./query-keys"
import type { Playlist } from "../types"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import { useAppContext } from "@/features/app-context"

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
      return api.getPlaylists(context)
    },
    enabled: !!context,
    staleTime: 30 * 1000
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
      return createPlaylistAction(playlist, userId)
    },
    onSuccess: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      }
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
  const { context } = useAppContext()

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
      const queryKey = context ? playlistsKeys.list(context) : playlistsKeys.lists()
      await queryClient.cancelQueries({ queryKey })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)
      queryClient.setQueryData<Playlist[]>(
        queryKey,
        (old) => old?.map((p) => (p.id === playlistId ? { ...p, ...updates } : p)) ?? []
      )
      return { previousPlaylists, queryKey }
    },
    onError: (_err, _vars, rollbackContext) => {
      if (rollbackContext?.previousPlaylists) {
        queryClient.setQueryData(rollbackContext.queryKey, rollbackContext.previousPlaylists)
      }
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: () => {
      toast.success(t.toasts?.playlistUpdated || "Playlist updated")
    },
    onSettled: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      }
    }
  })
}

/**
 * Hook to delete a playlist with optimistic updates
 */
export function useDeletePlaylist() {
  const queryClient = useQueryClient()
  const { t } = useLocale()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async (playlistId: string) => {
      return deletePlaylistAction(playlistId)
    },
    onMutate: async (playlistId) => {
      const queryKey = context ? playlistsKeys.list(context) : playlistsKeys.lists()
      await queryClient.cancelQueries({ queryKey })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)
      queryClient.setQueryData<Playlist[]>(
        queryKey,
        (old) => old?.filter((p) => p.id !== playlistId) ?? []
      )
      return { previousPlaylists, queryKey }
    },
    onError: (_err, _vars, rollbackContext) => {
      if (rollbackContext?.previousPlaylists) {
        queryClient.setQueryData(rollbackContext.queryKey, rollbackContext.previousPlaylists)
      }
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: () => {
      toast.success(t.toasts?.playlistDeleted || "Playlist deleted")
    },
    onSettled: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      }
    }
  })
}

/**
 * Hook to reorder songs within a playlist
 */
export function useReorderPlaylistSongs() {
  const queryClient = useQueryClient()
  const { context } = useAppContext()

  return useMutation({
    mutationFn: async ({
      playlistId,
      sourceIndex,
      destinationIndex
    }: {
      playlistId: string
      sourceIndex: number
      destinationIndex: number
    }) => {
      const queryKey = context ? playlistsKeys.list(context) : playlistsKeys.lists()
      const playlists = queryClient.getQueryData<Playlist[]>(queryKey)
      const playlist = playlists?.find((p) => p.id === playlistId)
      if (!playlist) throw new Error("Playlist not found")

      const newSongs = Array.from(playlist.songs)
      const [removed] = newSongs.splice(sourceIndex, 1)
      newSongs.splice(destinationIndex, 0, removed)

      return updatePlaylistAction(playlistId, { songs: newSongs })
    },
    onMutate: async ({ playlistId, sourceIndex, destinationIndex }) => {
      const queryKey = context ? playlistsKeys.list(context) : playlistsKeys.lists()
      await queryClient.cancelQueries({ queryKey })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)

      queryClient.setQueryData<Playlist[]>(queryKey, (old) =>
        old?.map((p) => {
          if (p.id !== playlistId) return p
          const newSongs = Array.from(p.songs)
          const [removed] = newSongs.splice(sourceIndex, 1)
          newSongs.splice(destinationIndex, 0, removed)
          return { ...p, songs: newSongs }
        }) ?? []
      )

      return { previousPlaylists, queryKey }
    },
    onError: (_err, _vars, rollbackContext) => {
      if (rollbackContext?.previousPlaylists) {
        queryClient.setQueryData(rollbackContext.queryKey, rollbackContext.previousPlaylists)
      }
    },
    onSettled: () => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.list(context) })
      } else {
        queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      }
    }
  })
}
