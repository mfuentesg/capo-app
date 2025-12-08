"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Song } from "@/types"

interface NewSongsContextType {
  newSongs: Song[]
  addNewSong: (song: Song) => void
  removeSong: (songId: string) => void
  isNewSong: (songId: string) => boolean
}

const NewSongsContext = createContext<NewSongsContextType | undefined>(undefined)

export function NewSongsProvider({ children }: { children: ReactNode }) {
  const [newSongs, setNewSongs] = useState<Song[]>([])

  const addNewSong = useCallback((song: Song) => {
    setNewSongs((prev) => {
      // Remove if already exists (update case)
      const filtered = prev.filter((s) => s.id !== song.id)
      return [...filtered, song]
    })
  }, [])

  const removeSong = useCallback((songId: string) => {
    setNewSongs((prev) => prev.filter((s) => s.id !== songId))
  }, [])

  const isNewSong = useCallback(
    (songId: string) => newSongs.some((s) => s.id === songId),
    [newSongs]
  )

  return (
    <NewSongsContext.Provider value={{ newSongs, addNewSong, removeSong, isNewSong }}>
      {children}
    </NewSongsContext.Provider>
  )
}

export function useNewSongs() {
  const context = useContext(NewSongsContext)
  if (context === undefined) {
    throw new Error("useNewSongs must be used within a NewSongsProvider")
  }
  return context
}
