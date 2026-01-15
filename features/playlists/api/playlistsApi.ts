/**
 * Playlists API - Supabase REST API functions
 *
 * Pure functions for data fetching and mutations.
 * No React hooks, no side effects beyond Supabase calls.
 */

import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import type { Playlist } from "@/features/playlists/types"

type PlaylistRow = Tables<"playlists"> & {
  playlist_songs?: Array<{ song_id: string; position: number }>
}

type PlaylistWithSongs = Playlist & {
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
 * Uses client-side Supabase client
 *
 * @param context - App context (personal or team)
 * @returns Promise<Playlist[]> - Array of playlists
 */
export async function getPlaylists(context: AppContext): Promise<Playlist[]> {
  const supabase = createClient()
  return getPlaylistsWithClient(supabase, context)
}

/**
 * Fetch playlists based on context (personal or team)
 * Accepts a Supabase client for server-side usage
 *
 * @param supabase - Supabase client instance (server or client)
 * @param context - App context (personal or team)
 * @returns Promise<Playlist[]> - Array of playlists
 */
export async function getPlaylistsWithClient(
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

  // Filter by context
  if (context.type === "personal") {
    query = query.eq("user_id", context.userId)
  } else {
    query = query.eq("team_id", context.teamId)
  }

  // Order by created_at descending
  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error

  // Transform database rows to app Playlist type
  return (data || []).map(transformPlaylistRow)
}

/**
 * Fetch playlist with songs (nested query)
 *
 * @param playlistId - Playlist UUID
 * @returns Promise<PlaylistWithSongs | null> - Playlist with nested songs or null
 */
export async function getPlaylistWithSongs(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _playlistId: string
): Promise<PlaylistWithSongs | null> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("playlists")
  //   .select(`
  //     *,
  //     playlist_songs (
  //       *,
  //       song:songs (*)
  //     )
  //   `)
  //   .eq("id", playlistId)
  //   .single()
  //
  // if (error) {
  //   if (error.code === "PGRST116") return null
  //   throw error
  // }
  //
  // return data

  throw new Error("Not implemented: getPlaylistWithSongs")
}

/**
 * Fetch public playlist by share code (anonymous access)
 *
 * @param shareCode - Share code string
 * @returns Promise<PlaylistWithSongs | null> - Public playlist or null
 */
export async function getPublicPlaylistByShareCode(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shareCode: string
): Promise<PlaylistWithSongs | null> {
  // TODO: Implement
  // const supabase = createClient() // Uses anon key for public access
  //
  // const { data, error } = await supabase
  //   .from("playlists")
  //   .select(`
  //     *,
  //     playlist_songs (
  //       *,
  //       song:songs (*)
  //     )
  //   `)
  //   .eq("share_code", shareCode)
  //   .eq("is_public", true)
  //   .or("share_expires_at.is.null,share_expires_at.gt.now()")
  //   .single()
  //
  // if (error) {
  //   if (error.code === "PGRST116") return null
  //   throw error
  // }
  //
  // return data

  throw new Error("Not implemented: getPublicPlaylistByShareCode")
}

/**
 * Create a new playlist
 *
 * @param playlistData - Playlist data to insert (from app Playlist type)
 * @param userId - User ID creating the playlist
 * @returns Promise<Playlist> - Created playlist
 */
export async function createPlaylist(
  playlistData: {
    name: string
    description?: string
    date?: string
    songs?: string[]
    visibility?: "private" | "public"
  },
  userId: string
): Promise<Playlist> {
  const supabase = createClient()

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playlistId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updates: TablesUpdate<"playlists">
): Promise<Playlist> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { data, error } = await supabase
  //   .from("playlists")
  //   .update(updates)
  //   .eq("id", playlistId)
  //   .select()
  //   .single()
  //
  // if (error) throw error
  // return data

  throw new Error("Not implemented: updatePlaylist")
}

/**
 * Delete a playlist
 *
 * @param playlistId - Playlist UUID
 * @returns Promise<void>
 */
export async function deletePlaylist(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playlistId: string
): Promise<void> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { error } = await supabase
  //   .from("playlists")
  //   .delete()
  //   .eq("id", playlistId)
  //
  // if (error) throw error

  throw new Error("Not implemented: deletePlaylist")
}

/**
 * Add a song to a playlist
 *
 * @param playlistId - Playlist UUID
 * @param songId - Song UUID
 * @param position - Position in playlist
 * @returns Promise<void>
 */
export async function addSongToPlaylist(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _playlistId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _songId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _position: number
): Promise<void> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { error } = await supabase
  //   .from("playlist_songs")
  //   .insert({
  //     playlist_id: playlistId,
  //     song_id: songId,
  //     position,
  //   })
  //
  // if (error) throw error

  throw new Error("Not implemented: addSongToPlaylist")
}

/**
 * Remove a song from a playlist
 *
 * @param playlistId - Playlist UUID
 * @param songId - Song UUID
 * @returns Promise<void>
 */
export async function removeSongFromPlaylist(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playlistId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  songId: string
): Promise<void> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // const { error } = await supabase
  //   .from("playlist_songs")
  //   .delete()
  //   .eq("playlist_id", playlistId)
  //   .eq("song_id", songId)
  //
  // if (error) throw error

  throw new Error("Not implemented: removeSongFromPlaylist")
}

/**
 * Reorder songs in a playlist
 *
 * @param playlistId - Playlist UUID
 * @param updates - Array of { songId, position } updates
 * @returns Promise<void>
 */
export async function reorderPlaylistSongs(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playlistId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updates: Array<{ songId: string; position: number }>
): Promise<void> {
  // TODO: Implement
  // const supabase = createClient()
  //
  // // Update positions in batch
  // const promises = updates.map(({ songId, position }) =>
  //   supabase
  //     .from("playlist_songs")
  //     .update({ position })
  //     .eq("playlist_id", playlistId)
  //     .eq("song_id", songId)
  // )
  //
  // const results = await Promise.all(promises)
  //
  // // Check for errors
  // for (const { error } of results) {
  //   if (error) throw error
  // }

  throw new Error("Not implemented: reorderPlaylistSongs")
}

/**
 * Ensure playlist has a share code (via RPC)
 * Uses the ensure_share_code RPC function from the database
 * Auto-generates share_code if missing when playlist becomes public
 *
 * @param playlistId - Playlist UUID
 * @returns Promise<string> - Share code
 */
export async function ensurePlaylistShareCode(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _playlistId: string
): Promise<string> {
  // TODO: Implement when ready
  // const supabase = createClient()
  //
  // const { data, error } = await supabase.rpc("ensure_share_code", {
  //   playlist_id: playlistId,
  // })
  //
  // if (error) throw error
  // return data as string

  throw new Error("Not implemented: ensurePlaylistShareCode")
}
