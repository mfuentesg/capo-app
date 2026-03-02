"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Song, UserSongSettings, UserPreferences } from "../types"
import type { UserProfileData } from "./user-preferences-api"
import type { AppContext } from "@/features/app-context"
import {
  getSongs as getSongsApi,
  createSong as createSongApi,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi
} from "./songsApi"
import {
  getUserSongSettings as getUserSongSettingsApi,
  upsertUserSongSettings as upsertUserSongSettingsApi,
  getAllUserSongSettings as getAllUserSongSettingsApi
} from "./user-song-settings-api"
import {
  getUserProfileData as getUserProfileDataApi,
  upsertUserPreferences as upsertUserPreferencesApi
} from "./user-preferences-api"

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

export async function getAllUserSongSettingsAction(): Promise<UserSongSettings[]> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return []
  return getAllUserSongSettingsApi(supabase, user.id)
}

/**
 * Fetches user preferences and all song settings in a single DB query
 * using PostgREST nested selects (profiles → user_song_settings).
 */
export async function getUserProfileDataAction(): Promise<UserProfileData | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null
  return getUserProfileDataApi(supabase, user.id)
}

export async function upsertUserPreferencesAction(
  preferences: UserPreferences
): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null
  return upsertUserPreferencesApi(supabase, user.id, preferences)
}
