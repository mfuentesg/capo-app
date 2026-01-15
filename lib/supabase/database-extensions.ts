/**
 * Database Extensions
 *
 * Custom composite types that combine multiple tables or add computed properties.
 * These extend the base types from database.types.ts
 *
 * Note: For complex nested queries, use QueryData from @supabase/supabase-js
 * instead of manually defining types (see playlistsApi.ts for example).
 */

import type { Tables, Enums } from "./database.types"

/**
 * Song with position in playlist
 * Used when fetching songs that belong to a playlist
 */
export type SongWithPosition = Tables<"songs"> & {
  position: number
}

/**
 * Playlist with nested songs
 * Used when fetching a playlist with its songs included
 *
 * Note: For actual query results, use QueryData helper from @supabase/supabase-js
 * This type is provided as a reference/fallback
 */
export type PlaylistWithSongs = Tables<"playlists"> & {
  playlist_songs: Array<{
    position: number
    song: Tables<"songs">
  }>
}

/**
 * Team with members
 * Used when fetching a team with its members included
 */
export type TeamWithMembers = Tables<"teams"> & {
  team_members: Array<{
    user: Tables<"profiles">
    role: Enums<"team_role_enum">
    joined_at: string
  }>
}
