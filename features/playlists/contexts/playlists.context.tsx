"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import type { Playlist } from "@/features/playlists/types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/features/playlists/api"
import { useAppContext } from "@/features/app-context"
import { useUser } from "@/features/auth"

export interface PlaylistsContextType {
  playlists: Playlist[]
  addPlaylist: (playlist: Playlist) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  reorderPlaylistSongs: (playlistId: string, sourceIndex: number, destinationIndex: number) => void
  isLoading: boolean
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined)

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { context } = useAppContext()
  const { data: user } = useUser()
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
      return api.createPlaylist(playlist, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
    }
  })

  const updatePlaylistMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Playlist> }) =>
      api.updatePlaylist(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
    }
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => api.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists", context] })
    }
  })

  const addPlaylist = useCallback(
    (playlist: Playlist) => {
      createPlaylistMutation.mutate(playlist)
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

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        addPlaylist,
        updatePlaylist,
        deletePlaylist,
        reorderPlaylistSongs,
        isLoading
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  )
}

export function usePlaylists() {
  const context = useContext(PlaylistsContext)
  if (context === undefined) {
    throw new Error("usePlaylists must be used within a PlaylistsProvider")
  }
  return context
}
