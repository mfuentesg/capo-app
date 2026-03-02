import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type { UserPreferences, UserSongSettings } from "../types"

type PreferencesJson = Database["public"]["Tables"]["profiles"]["Row"]["preferences"]

function mapJsonToPreferences(json: PreferencesJson): UserPreferences {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { minimalistLyricsView: false }
  }
  return {
    minimalistLyricsView: json["minimalistLyricsView"] === true
  }
}

function mapRowToSongSettings(row: {
  song_id: string
  capo: number
  transpose: number
  font_size: number | null
}): UserSongSettings {
  return {
    songId: row.song_id,
    capo: row.capo,
    transpose: row.transpose,
    fontSize: row.font_size ?? undefined
  }
}

export interface UserProfileData {
  preferences: UserPreferences
  songSettings: UserSongSettings[]
}

/**
 * Fetches user preferences and all song settings in a single query
 * using PostgREST nested selects (profiles → user_song_settings via FK).
 */
export async function getUserProfileData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select("preferences, user_song_settings(song_id, capo, transpose, font_size)")
    .eq("id", userId)
    .single()

  if (error) throw error

  const songSettings = Array.isArray(data.user_song_settings)
    ? data.user_song_settings.map(mapRowToSongSettings)
    : []

  return {
    preferences: mapJsonToPreferences(data.preferences),
    songSettings
  }
}

export async function upsertUserPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  preferences: UserPreferences
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      preferences: { minimalistLyricsView: preferences.minimalistLyricsView },
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select("preferences")
    .single()

  if (error) throw error
  return mapJsonToPreferences(data.preferences)
}
