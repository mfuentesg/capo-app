import { createApi } from "@/lib/supabase/factory"
import * as playlistsApi from "./playlistsApi"

/**
 * Playlists API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */
export const api = createApi(playlistsApi)

// Re-export all functions
export * from "./playlistsApi"
export {
  getPlaylistsAction,
  getPlaylistWithSongsAction,
  createPlaylistAction,
  updatePlaylistAction,
  deletePlaylistAction,
  addSongToPlaylistAction,
  removeSongFromPlaylistAction,
  reorderPlaylistSongsAction
} from "./actions"
