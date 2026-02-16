/**
 * Songs API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import type { Song as FrontendSong } from "@/features/songs/types"
import { applyContextFilter } from "@/lib/supabase/apply-context-filter"

/**
 * Maps database song to frontend song type
 * Converts status enum to isDraft boolean
 */
function mapDBSongToFrontend(dbSong: Tables<"songs">): FrontendSong {
  return {
    id: dbSong.id,
    title: dbSong.title,
    artist: dbSong.artist || "",
    key: dbSong.key || "",
    bpm: dbSong.bpm || 0,
    lyrics: dbSong.lyrics || undefined,
    notes: dbSong.notes || undefined,
    transpose: dbSong.transpose ?? 0,
    capo: dbSong.capo ?? 0,
    // tags field not in database schema - omit for now
    isDraft: dbSong.status === "draft"
  }
}

/**
 * Maps frontend song to database insert type
 * Converts isDraft boolean to status enum
 */
function mapFrontendSongToDB(
  song: Partial<FrontendSong>,
  userId: string,
  context?: AppContext
): TablesInsert<"songs"> {
  const isTeam = context?.type === "team"
  return {
    title: song.title || "",
    artist: song.artist || null,
    key: song.key || null,
    bpm: song.bpm || null,
    lyrics: song.lyrics || null,
    notes: song.notes || null,
    transpose: song.transpose ?? 0,
    capo: song.capo ?? 0,
    status: song.isDraft ? "draft" : "published",
    user_id: isTeam ? null : userId,
    team_id: isTeam ? context.teamId : null,
    created_by: userId
  }
}

/**
 * Maps frontend song updates to database update type
 */
function mapFrontendUpdatesToDB(updates: Partial<FrontendSong>): TablesUpdate<"songs"> {
  const dbUpdate: TablesUpdate<"songs"> = {}

  if (updates.title !== undefined) dbUpdate.title = updates.title
  if (updates.artist !== undefined) dbUpdate.artist = updates.artist || null
  if (updates.key !== undefined) dbUpdate.key = updates.key || null
  if (updates.bpm !== undefined) dbUpdate.bpm = updates.bpm || null
  if (updates.lyrics !== undefined) dbUpdate.lyrics = updates.lyrics || null
  if (updates.notes !== undefined) dbUpdate.notes = updates.notes || null
  if (updates.transpose !== undefined) dbUpdate.transpose = updates.transpose
  if (updates.capo !== undefined) dbUpdate.capo = updates.capo
  if (updates.isDraft !== undefined) {
    dbUpdate.status = updates.isDraft ? "draft" : "published"
  }

  return dbUpdate
}

/**
 * Fetch songs based on context (personal or team)
 *
 * @param context - App context (personal or team)
 * @returns Promise<FrontendSong[]> - Array of songs
 */
export async function getSongs(
  supabase: SupabaseClient,
  context: AppContext
): Promise<FrontendSong[]> {
  let query = supabase.from("songs").select("*")
  query = applyContextFilter(query, context)

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return (data || []).map(mapDBSongToFrontend)
}

/**
 * Get a single song by ID
 *
 * @param songId - Song UUID
 * @returns Promise<FrontendSong | null> - Song or null if not found
 */
export async function getSong(
  supabase: SupabaseClient,
  songId: string
): Promise<FrontendSong | null> {
  const response = await supabase.from("songs").select("*").eq("id", songId).single()

  if (response.error) {
    if (response.error.code === "PGRST116") return null
    throw response.error
  }

  return response.data ? mapDBSongToFrontend(response.data) : null
}

/**
 * Get multiple songs by their IDs
 *
 * @param songIds - Array of song UUIDs
 * @returns Promise<FrontendSong[]> - Array of songs
 */
export async function getSongsByIds(
  supabase: SupabaseClient,
  songIds: string[]
): Promise<FrontendSong[]> {
  if (songIds.length === 0) return []

  const { data, error } = await supabase.from("songs").select("*").in("id", songIds)

  if (error) throw error
  return (data || []).map(mapDBSongToFrontend)
}

/**
 * Create a new song
 *
 * @param song - Song data to insert (frontend type)
 * @param userId - User ID creating the song
 * @returns Promise<FrontendSong> - Created song
 */
export async function createSong(
  supabase: SupabaseClient,
  song: Partial<FrontendSong>,
  userId: string,
  context?: AppContext
): Promise<FrontendSong> {
  const dbSong = mapFrontendSongToDB(song, userId, context)

  const response = await supabase.from("songs").insert(dbSong).select().single()

  if (response.error) throw response.error
  return mapDBSongToFrontend(response.data)
}

/**
 * Update a song
 *
 * @param songId - Song UUID
 * @param updates - Partial song data to update (frontend type)
 * @returns Promise<FrontendSong> - Updated song
 */
export async function updateSong(
  supabase: SupabaseClient,
  songId: string,
  updates: Partial<FrontendSong>
): Promise<FrontendSong> {
  const dbUpdates = mapFrontendUpdatesToDB(updates)

  const response = await supabase.from("songs").update(dbUpdates).eq("id", songId).select().single()

  if (response.error) throw response.error
  return mapDBSongToFrontend(response.data)
}

/**
 * Delete a song
 *
 * @param songId - Song UUID
 * @returns Promise<void>
 */
export async function deleteSong(supabase: SupabaseClient, songId: string): Promise<void> {
  const { error } = await supabase.from("songs").delete().eq("id", songId)

  if (error) throw error
}
