"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Song } from "../types"
import {
  createSong as createSongApi,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi
} from "./songsApi"

export async function createSongAction(song: Partial<Song>, userId: string): Promise<Song> {
  const supabase = await createClient()
  const result = await createSongApi(supabase, song, userId)
  revalidatePath("/dashboard/songs")
  return result
}

export async function updateSongAction(songId: string, updates: Partial<Song>): Promise<Song> {
  const supabase = await createClient()
  const result = await updateSongApi(supabase, songId, updates)
  revalidatePath("/dashboard/songs")
  revalidatePath(`/dashboard/songs/${songId}`)
  return result
}

export async function deleteSongAction(songId: string): Promise<void> {
  const supabase = await createClient()
  await deleteSongApi(supabase, songId)
  revalidatePath("/dashboard/songs")
}
