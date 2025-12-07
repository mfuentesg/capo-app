"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Playlist } from "@/types"

interface PlaylistsContextType {
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
const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Sunday Morning Worship",
    description: "Opening worship set for Sunday service",
    date: "2024-12-08",
    songs: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440004",
      "550e8400-e29b-41d4-a716-446655440006"
    ],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
    visibility: "public",
    allowGuestEditing: true,
    shareCode: "ABC123"
  },
  {
    id: "2",
    name: "Youth Night",
    description: "Energetic songs for youth service",
    date: "2024-12-10",
    songs: [
      "550e8400-e29b-41d4-a716-446655440003",
      "550e8400-e29b-41d4-a716-446655440005",
      "550e8400-e29b-41d4-a716-446655440007"
    ],
    createdAt: "2024-11-28T15:00:00Z",
    updatedAt: "2024-11-28T15:00:00Z",
    visibility: "public",
    allowGuestEditing: false,
    shareCode: "XYZ789"
  },
  {
    id: "3",
    name: "Christmas Special",
    description: "Christmas themed worship songs",
    date: "2024-12-25",
    songs: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440008"],
    createdAt: "2024-11-20T12:00:00Z",
    updatedAt: "2024-11-20T12:00:00Z",
    visibility: "private"
  },
  {
    id: "4",
    name: "Evening Service Ideas",
    description: "Collection of songs to review for evening service",
    date: "2024-12-15",
    songs: ["550e8400-e29b-41d4-a716-446655440009", "550e8400-e29b-41d4-a716-446655440010"],
    createdAt: "2024-12-03T14:00:00Z",
    updatedAt: "2024-12-03T14:00:00Z",
    isDraft: true,
    visibility: "private"
  },
  {
    id: "5",
    name: "New Songs to Learn",
    description: "Draft playlist - needs review",
    songs: [],
    createdAt: "2024-12-05T09:00:00Z",
    updatedAt: "2024-12-05T09:00:00Z",
    isDraft: true
  }
]

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists)

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
