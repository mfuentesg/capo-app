"use server"

import { createClient } from "@/lib/supabase/server"
import type { Song } from "@/features/songs/types"
import {
  createSong as createSongApi,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi
} from "./songsApi"

export async function createSongAction(song: Partial<Song>, userId: string): Promise<Song> {
  const supabase = await createClient()
  return createSongApi(supabase, song, userId)
}

export async function updateSongAction(songId: string, updates: Partial<Song>): Promise<Song> {
  const supabase = await createClient()
  return updateSongApi(supabase, songId, updates)
}

export async function deleteSongAction(songId: string): Promise<void> {
  const supabase = await createClient()
  return deleteSongApi(supabase, songId)
}
