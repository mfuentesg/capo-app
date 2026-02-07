/**
 * Playlists API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import type { Playlist } from "@/features/playlists/types"
import type { Song } from "@/features/songs"
import { applyContextFilter } from "@/lib/supabase/apply-context-filter"

type PlaylistRow = Tables<"playlists"> & {
  playlist_songs?: Array<{ song_id: string; position: number }>
}

type PlaylistWithSongs = Omit<Playlist, "songs"> & {
  songs: Song[]
  playlist_songs?: Array<{ song_id: string; position: number; song: Tables<"songs"> }>
}

/**
 * Transform database playlist row to app Playlist type
 */
function transformPlaylistRow(row: PlaylistRow): Playlist {
  const songs =
    row.playlist_songs?.sort((a, b) => a.position - b.position).map((ps) => ps.song_id) || []

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    date: row.date || undefined,
    songs,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    visibility: row.is_public ? "public" : "private",
    shareCode: row.share_code || undefined
  }
}

/**
 * Fetch playlists based on context (personal or team)
 *
 * @param supabase - Supabase client instance
 * @param context - App context (personal or team)
 * @returns Promise<Playlist[]> - Array of playlists
 */
export async function getPlaylists(
  supabase: SupabaseClient<Database>,
  context: AppContext
): Promise<Playlist[]> {
  // Build query with playlist_songs joined
  let query = supabase.from("playlists").select(`
      *,
      playlist_songs (
        song_id,
        position
      )
    `)

  query = applyContextFilter(query, context)

  // Order by created_at descending
  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error

  // Transform database rows to app Playlist type
  return (data || []).map(transformPlaylistRow)
}

/**
 * Fetch playlist with songs (nested query)
 *
 * @param supabase - Supabase client instance
 * @param playlistId - Playlist UUID
 * @returns Promise<PlaylistWithSongs | null> - Playlist with nested songs or null
 */
export async function getPlaylistWithSongs(
  supabase: SupabaseClient<Database>,
  playlistId: string
): Promise<PlaylistWithSongs | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select(
      `
      *,
      playlist_songs (
        song_id,
        position,
        song:songs (*)
      )
    `
    )
    .eq("id", playlistId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  if (!data) return null

  const sortedPlaylistSongs =
    data.playlist_songs?.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ) || []

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    date: data.date || undefined,
    songs: sortedPlaylistSongs.map((ps: { song: Tables<"songs"> }): Song => {
      const song = ps.song
      return {
        id: song.id,
        title: song.title,
        artist: song.artist || "",
        key: song.key || "",
        bpm: song.bpm || 0,
        lyrics: song.lyrics || undefined,
        notes: song.notes || undefined,
        isDraft: song.status === "draft"
      }
    }),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    visibility: data.is_public ? "public" : "private",
    shareCode: data.share_code || undefined,
    playlist_songs: sortedPlaylistSongs
  }
}

/**
 * Fetch public playlist by share code (anonymous access)
 *
 * @param shareCode - Share code string
 * @returns Promise<PlaylistWithSongs | null> - Public playlist or null
 */
export async function getPublicPlaylistByShareCode(
  supabase: SupabaseClient<Database>,
  shareCode: string
): Promise<PlaylistWithSongs | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select(
      `
      *,
      playlist_songs (
        *,
        song:songs (*)
      )
    `
    )
    .eq("share_code", shareCode)
    .eq("is_public", true)
    .or("share_expires_at.is.null,share_expires_at.gt.now()")
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  if (!data) return null

  const sortedPlaylistSongs =
    data.playlist_songs?.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ) || []

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    date: data.date || undefined,
    songs: sortedPlaylistSongs.map((ps: { song: Tables<"songs"> }): Song => {
      const song = ps.song
      return {
        id: song.id,
        title: song.title,
        artist: song.artist || "",
        key: song.key || "",
        bpm: song.bpm || 0,
        lyrics: song.lyrics || undefined,
        notes: song.notes || undefined,
        isDraft: song.status === "draft"
      }
    }),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    visibility: data.is_public ? "public" : "private",
    shareCode: data.share_code || undefined,
    playlist_songs: sortedPlaylistSongs
  }
}

/**
 * Create a new playlist
 *
 * @param supabase - Supabase client instance
 * @param playlistData - Playlist data to insert (from app Playlist type)
 * @param userId - User ID creating the playlist
 * @returns Promise<Playlist> - Created playlist
 */
export async function createPlaylist(
  supabase: SupabaseClient<Database>,
  playlistData: {
    name: string
    description?: string
    date?: string
    songs?: string[]
    visibility?: "private" | "public"
  },
  userId: string
): Promise<Playlist> {
  // Convert app Playlist to database Insert type
  const isPublic = playlistData.visibility === "public"
  const playlistInsert: TablesInsert<"playlists"> = {
    name: playlistData.name,
    description: playlistData.description || null,
    date: playlistData.date || null,
    is_public: isPublic,
    user_id: userId,
    team_id: null,
    created_by: userId,
    // share_code will be generated by RPC if is_public is true
    share_code: null
  }

  // Insert playlist
  const { data: playlistRow, error: playlistError } = await supabase
    .from("playlists")
    .insert(playlistInsert)
    .select()
    .single()

  if (playlistError) throw playlistError

  // If playlist is public, ensure share_code is generated
  if (isPublic && playlistRow) {
    const { data: shareCode, error: shareCodeError } = await supabase.rpc("ensure_share_code", {
      playlist_id: playlistRow.id
    })

    if (shareCodeError) {
      console.error("Error generating share code:", shareCodeError)
      // Don't throw - playlist was created, just missing share code
    } else if (shareCode) {
      // Update playlist with share code
      await supabase.from("playlists").update({ share_code: shareCode }).eq("id", playlistRow.id)
      playlistRow.share_code = shareCode
    }
  }

  // Insert playlist_songs if songs are provided
  if (playlistData.songs && playlistData.songs.length > 0 && playlistRow) {
    const playlistSongs = playlistData.songs.map((songId, index) => ({
      playlist_id: playlistRow.id,
      song_id: songId,
      position: index
    }))

    const { error: songsError } = await supabase.from("playlist_songs").insert(playlistSongs)

    if (songsError) {
      // If songs insertion fails, we should probably rollback the playlist
      // For now, log error and continue - playlist is created but without songs
      console.error("Error adding songs to playlist:", songsError)
    }
  }

  // Fetch the complete playlist with songs
  const { data: completePlaylist, error: fetchError } = await supabase
    .from("playlists")
    .select(
      `
      *,
      playlist_songs (
        song_id,
        position
      )
    `
    )
    .eq("id", playlistRow.id)
    .single()

  if (fetchError) throw fetchError

  return transformPlaylistRow(completePlaylist)
}

/**
 * Update a playlist
 *
 * @param playlistId - Playlist UUID
 * @param updates - Partial playlist data to update
 * @returns Promise<Playlist> - Updated playlist
 */
export async function updatePlaylist(
  supabase: SupabaseClient<Database>,
  playlistId: string,
  updates: Partial<Playlist>
): Promise<Playlist> {
  const dbUpdates: TablesUpdate<"playlists"> = {}

  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description || null
  if (updates.date !== undefined) dbUpdates.date = updates.date || null
  if (updates.visibility !== undefined) dbUpdates.is_public = updates.visibility === "public"

  const { data, error } = await supabase
    .from("playlists")
    .update(dbUpdates)
    .eq("id", playlistId)
    .select()
    .single()

  if (error) throw error
  return transformPlaylistRow(data)
}

/**
 * Delete a playlist
 *
 * @param playlistId - Playlist UUID
 * @returns Promise<void>
 */
export async function deletePlaylist(
  supabase: SupabaseClient<Database>,
  playlistId: string
): Promise<void> {
  const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

  if (error) throw error
}

/**
 * Add a song to a playlist
 *
 * @param supabase - Supabase client instance
 * @param playlistId - Playlist UUID
 * @param songId - Song UUID
 * @param position - Position in playlist (optional, defaults to end)
 * @returns Promise<void>
 */
export async function addSongToPlaylist(
  supabase: SupabaseClient<Database>,
  playlistId: string,
  songId: string,
  position?: number
): Promise<void> {
  // If no position specified, get the max position and add at end
  let insertPosition = position
  if (insertPosition === undefined) {
    const { data: existing } = await supabase
      .from("playlist_songs")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1)

    insertPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0
  }

  const { error } = await supabase.from("playlist_songs").insert({
    playlist_id: playlistId,
    song_id: songId,
    position: insertPosition
  })

  if (error) throw error
}

/**
 * Remove a song from a playlist
 *
 * @param supabase - Supabase client instance
 * @param playlistId - Playlist UUID
 * @param songId - Song UUID
 * @returns Promise<void>
 */
export async function removeSongFromPlaylist(
  supabase: SupabaseClient<Database>,
  playlistId: string,
  songId: string
): Promise<void> {
  const { error } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId)

  if (error) throw error
}

/**
 * Reorder songs in a playlist
 *
 * @param supabase - Supabase client instance
 * @param playlistId - Playlist UUID
 * @param updates - Array of { songId, position } updates
 * @returns Promise<void>
 */
export async function reorderPlaylistSongs(
  supabase: SupabaseClient<Database>,
  playlistId: string,
  updates: Array<{ songId: string; position: number }>
): Promise<void> {
  // Update positions in batch
  const promises = updates.map(({ songId, position }) =>
    supabase
      .from("playlist_songs")
      .update({ position })
      .eq("playlist_id", playlistId)
      .eq("song_id", songId)
  )

  const results = await Promise.all(promises)

  // Check for errors
  for (const { error } of results) {
    if (error) throw error
  }
}

/**
 * Ensure playlist has a share code (via RPC)
 * Uses the ensure_share_code RPC function from the database
 * Auto-generates share_code if missing when playlist becomes public
 *
 * @param supabase - Supabase client instance
 * @param playlistId - Playlist UUID
 * @returns Promise<string> - Share code
 */
export async function ensurePlaylistShareCode(
  supabase: SupabaseClient<Database>,
  playlistId: string
): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_share_code", {
    playlist_id: playlistId
  })

  if (error) throw error
  return data as string
}
