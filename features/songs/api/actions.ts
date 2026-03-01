"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Song, UserSongSettings } from "../types"
import type { AppContext } from "@/features/app-context"
import {
  getSongs as getSongsApi,
  createSong as createSongApi,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi
} from "./songsApi"
import {
  getUserSongSettings as getUserSongSettingsApi,
  upsertUserSongSettings as upsertUserSongSettingsApi
} from "./user-song-settings-api"

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

export async function getUserSongSettingsAction(
  songId: string
): Promise<UserSongSettings | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null
  return getUserSongSettingsApi(supabase, user.id, songId)
}

export async function upsertUserSongSettingsAction(
  songId: string,
  settings: Omit<UserSongSettings, "songId">
): Promise<UserSongSettings> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return upsertUserSongSettingsApi(supabase, user.id, songId, settings)
}
