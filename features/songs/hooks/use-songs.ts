import { useState, useCallback } from "react"
import type { Song } from "../types"

export function useSongs(initialSongs: Song[]) {
  const [songs, setSongs] = useState<Song[]>(initialSongs)

  const updateSong = useCallback((songId: string, updates: Partial<Song>) => {
    setSongs((prev) => prev.map((song) => (song.id === songId ? { ...song, ...updates } : song)))
  }, [])

  const addSong = useCallback((song: Song) => {
    setSongs((prev) => [song, ...prev])
  }, [])

  const deleteSong = useCallback((songId: string) => {
    setSongs((prev) => prev.filter((song) => song.id !== songId))
  }, [])

  return { songs, updateSong, addSong, deleteSong, setSongs }
}
