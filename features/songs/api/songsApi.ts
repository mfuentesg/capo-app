/**
 * Songs API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import type { Song as FrontendSong } from "@/features/songs/types"

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
    // tags field not in database schema - omit for now
    isDraft: dbSong.status === "draft"
    // fontSize, transpose, capo are frontend-only fields - not stored in DB
  }
}

/**
 * Maps frontend song to database insert type
 * Converts isDraft boolean to status enum
 */
function mapFrontendSongToDB(song: Partial<FrontendSong>, userId: string): TablesInsert<"songs"> {
  return {
    title: song.title || "",
    artist: song.artist || null,
    key: song.key || null,
    bpm: song.bpm || null,
    lyrics: song.lyrics || null,
    notes: song.notes || null,
    status: song.isDraft ? "draft" : "published",
    user_id: userId,
    team_id: null,
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
export async function getSongs(context: AppContext): Promise<FrontendSong[]> {
  const supabase = await createClient()

  let query = supabase.from("songs").select("*")

  if (context.type === "personal") {
    query = query.eq("user_id", context.userId)
  } else {
    query = query.eq("team_id", context.teamId)
  }

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
export async function getSong(songId: string): Promise<FrontendSong | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("songs").select("*").eq("id", songId).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data ? mapDBSongToFrontend(data) : null
}

/**
 * Get multiple songs by their IDs
 *
 * @param songIds - Array of song UUIDs
 * @returns Promise<FrontendSong[]> - Array of songs
 */
export async function getSongsByIds(songIds: string[]): Promise<FrontendSong[]> {
  if (songIds.length === 0) return []

  const supabase = await createClient()

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
  song: Partial<FrontendSong>,
  userId: string
): Promise<FrontendSong> {
  const supabase = await createClient()

  const dbSong = mapFrontendSongToDB(song, userId)

  const { data, error } = await supabase.from("songs").insert(dbSong).select().single()

  if (error) throw error
  return mapDBSongToFrontend(data)
}

/**
 * Update a song
 *
 * @param songId - Song UUID
 * @param updates - Partial song data to update (frontend type)
 * @returns Promise<FrontendSong> - Updated song
 */
export async function updateSong(
  songId: string,
  updates: Partial<FrontendSong>
): Promise<FrontendSong> {
  const supabase = await createClient()

  const dbUpdates = mapFrontendUpdatesToDB(updates)

  const { data, error } = await supabase
    .from("songs")
    .update(dbUpdates)
    .eq("id", songId)
    .select()
    .single()

  if (error) throw error
  return mapDBSongToFrontend(data)
}

/**
 * Delete a song
 *
 * @param songId - Song UUID
 * @returns Promise<void>
 */
export async function deleteSong(songId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("songs").delete().eq("id", songId)

  if (error) throw error
}
