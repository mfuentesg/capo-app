"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Song } from "../types"
import type { AppContext } from "@/features/app-context"
import {
  getSongs as getSongsApi,
  createSong as createSongApi,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi
} from "./songsApi"

export async function getSongsAction(context: AppContext): Promise<Song[]> {
  const supabase = await createClient()
  return getSongsApi(supabase, context)
}

export async function createSongAction(
  song: Partial<Song>,
  userId: string,
  context?: AppContext
): Promise<Song> {
  const supabase = await createClient()
  const result = context
    ? await createSongApi(supabase, song, userId, context)
    : await createSongApi(supabase, song, userId)
  revalidatePath("/dashboard/songs")
  return result
}

export async function updateSongAction(songId: string, updates: Partial<Song>): Promise<Song> {
  const supabase = await createClient()
  return updateSongApi(supabase, songId, updates)
}

export async function deleteSongAction(songId: string): Promise<void> {
  const supabase = await createClient()
  await deleteSongApi(supabase, songId)
  revalidatePath("/dashboard/songs")
}
