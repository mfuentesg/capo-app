"use client"

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react"
import type { Playlist } from "../types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../api"
import { createPlaylistAction, updatePlaylistAction, deletePlaylistAction } from "../api/actions"
import { useAppContext } from "@/features/app-context"
import { useUser } from "@/features/auth"
import { useLocale } from "@/features/settings"
import { toast } from "sonner"

export interface PlaylistsContextType {
  playlists: Playlist[]
  addPlaylist: (playlist: Playlist) => Promise<Playlist>
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  reorderPlaylistSongs: (playlistId: string, sourceIndex: number, destinationIndex: number) => void
  isLoading: boolean
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined)

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { context } = useAppContext()
  const { data: user } = useUser()
  const { t } = useLocale()
  const queryClient = useQueryClient()

  const { data: fetchedPlaylists = [], isLoading } = useQuery({
    queryKey: ["playlists", context],
    queryFn: () => (context ? api.getPlaylists(context) : Promise.resolve([])),
    staleTime: 30 * 1000,
    enabled: !!context
  })

  const playlists = fetchedPlaylists

  const createPlaylistMutation = useMutation({
    mutationFn: (playlist: Playlist) => {
      if (!user?.id) throw new Error("User not found")
      return createPlaylistAction(playlist, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
      toast.success(t.toasts?.playlistCreated || "Playlist created")
    },
    onError: (error) => {
      console.error("Error creating playlist:", error)
      toast.error(t.toasts?.error || "Something went wrong")
    }
  })

  const updatePlaylistMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Playlist> }) =>
      updatePlaylistAction(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["playlists", context] })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(["playlists", context])
      queryClient.setQueryData<Playlist[]>(
        ["playlists", context],
        (old) => old?.map((p) => (p.id === id ? { ...p, ...updates } : p)) ?? []
      )
      return { previousPlaylists }
    },
    onError: (_err, _vars, rollback) => {
      if (rollback?.previousPlaylists) {
        queryClient.setQueryData(["playlists", context], rollback.previousPlaylists)
      }
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: () => {
      toast.success(t.toasts?.playlistUpdated || "Playlist updated")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
    }
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => deletePlaylistAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["playlists", context] })
      const previousPlaylists = queryClient.getQueryData<Playlist[]>(["playlists", context])
      queryClient.setQueryData<Playlist[]>(
        ["playlists", context],
        (old) => old?.filter((p) => p.id !== id) ?? []
      )
      return { previousPlaylists }
    },
    onError: (_err, _vars, rollback) => {
      if (rollback?.previousPlaylists) {
        queryClient.setQueryData(["playlists", context], rollback.previousPlaylists)
      }
      toast.error(t.toasts?.error || "Something went wrong")
    },
    onSuccess: () => {
      toast.success(t.toasts?.playlistDeleted || "Playlist deleted")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
    }
  })

  const addPlaylist = useCallback(
    (playlist: Playlist) => {
      return createPlaylistMutation.mutateAsync(playlist)
    },
    [createPlaylistMutation]
  )

  const updatePlaylist = useCallback(
    (id: string, updates: Partial<Playlist>) => {
      updatePlaylistMutation.mutate({ id, updates })
    },
    [updatePlaylistMutation]
  )

  const deletePlaylist = useCallback(
    (id: string) => {
      deletePlaylistMutation.mutate(id)
    },
    [deletePlaylistMutation]
  )

  const reorderPlaylistSongs = useCallback(
    (playlistId: string, sourceIndex: number, destinationIndex: number) => {
      const playlist = playlists.find((p: Playlist) => p.id === playlistId)
      if (!playlist) return

      const newSongs = Array.from(playlist.songs)
      const [removed] = newSongs.splice(sourceIndex, 1)
      newSongs.splice(destinationIndex, 0, removed)

      updatePlaylistMutation.mutate({
        id: playlistId,
        updates: { songs: newSongs }
      })
    },
    [playlists, updatePlaylistMutation]
  )

  const value = useMemo(
    () => ({
      playlists,
      addPlaylist,
      updatePlaylist,
      deletePlaylist,
      reorderPlaylistSongs,
      isLoading
    }),
    [playlists, addPlaylist, updatePlaylist, deletePlaylist, reorderPlaylistSongs, isLoading]
  )

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>
}

export function usePlaylists() {
  const context = useContext(PlaylistsContext)
  if (context === undefined) {
    throw new Error("usePlaylists must be used within a PlaylistsProvider")
  }
  return context
}
