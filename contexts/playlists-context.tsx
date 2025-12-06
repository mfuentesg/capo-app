"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Playlist } from "@/types"

interface PlaylistsContextType {
  playlists: Playlist[]
  addPlaylist: (playlist: Playlist) => void
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
}

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined)

const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Sunday Morning Worship",
    description: "Opening worship set for Sunday service",
    date: "2024-12-08",
    songs: [],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z"
  },
  {
    id: "2",
    name: "Youth Night",
    description: "Energetic songs for youth service",
    date: "2024-12-10",
    songs: [],
    createdAt: "2024-11-28T15:00:00Z",
    updatedAt: "2024-11-28T15:00:00Z"
  },
  {
    id: "3",
    name: "Christmas Special",
    description: "Christmas themed worship songs",
    date: "2024-12-25",
    songs: [],
    createdAt: "2024-11-20T12:00:00Z",
    updatedAt: "2024-11-20T12:00:00Z"
  }
]

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists)

  const addPlaylist = useCallback((playlist: Playlist) => {
    setPlaylists((prev) => [...prev, playlist])
  }, [])

  const updatePlaylist = useCallback((id: string, updates: Partial<Playlist>) => {
    setPlaylists((prev) =>
      prev.map((playlist) => (playlist.id === id ? { ...playlist, ...updates } : playlist))
    )
  }, [])

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id))
  }, [])

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        addPlaylist,
        updatePlaylist,
        deletePlaylist
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
