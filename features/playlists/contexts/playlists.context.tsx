"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Playlist } from "@/features/playlists/types"
import { mockPlaylists as initialMockPlaylists } from "@/lib/mock-data"

export interface PlaylistsContextType {
  playlists: Playlist[]
  addPlaylist: (playlist: Playlist) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  reorderPlaylistSongs: (playlistId: string, sourceIndex: number, destinationIndex: number) => void
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined)

// TODO: Replace with backend API calls:
// - Fetch playlists
// - Create new playlist
// - Update playlist
// - Delete playlist
// - Reorder songs in playlist

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialMockPlaylists)

  const addPlaylist = useCallback((playlist: Playlist) => {
    setPlaylists((prev) => [...prev, playlist])
  }, [])

  const updatePlaylist = useCallback((id: string, updates: Partial<Playlist>) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== id) return playlist

        // Generate shareCode if visibility is being set to public and shareCode doesn't exist
        const updatedPlaylist = { ...playlist, ...updates }
        if (updates.visibility === "public" && !updatedPlaylist.shareCode) {
          updatedPlaylist.shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        }

        return updatedPlaylist
      })
    )
  }, [])

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id))
  }, [])

  const reorderPlaylistSongs = useCallback(
    (playlistId: string, sourceIndex: number, destinationIndex: number) => {
      // TODO: Replace with backend API call to update playlist songs order
      setPlaylists((prev) =>
        prev.map((playlist) => {
          if (playlist.id !== playlistId) return playlist

          const newSongs = Array.from(playlist.songs)
          const [removed] = newSongs.splice(sourceIndex, 1)
          newSongs.splice(destinationIndex, 0, removed)

          return {
            ...playlist,
            songs: newSongs,
            updatedAt: new Date().toISOString()
          }
        })
      )
    },
    []
  )

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        addPlaylist,
        updatePlaylist,
        deletePlaylist,
        reorderPlaylistSongs
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
