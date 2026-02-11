"use server"

import { createClient } from "@/lib/supabase/server"
import type { Playlist } from "@/features/playlists/types"
import {
  createPlaylist as createPlaylistApi,
  updatePlaylist as updatePlaylistApi,
  deletePlaylist as deletePlaylistApi,
  addSongToPlaylist as addSongToPlaylistApi,
  removeSongFromPlaylist as removeSongFromPlaylistApi,
  reorderPlaylistSongs as reorderPlaylistSongsApi
} from "./playlistsApi"

export async function createPlaylistAction(
  playlistData: {
    name: string
    description?: string
    date?: string
    songs?: string[]
    visibility?: "private" | "public"
  },
  userId: string
): Promise<Playlist> {
  const supabase = await createClient()
  return createPlaylistApi(supabase, playlistData, userId)
}

export async function updatePlaylistAction(
  playlistId: string,
  updates: Partial<Playlist>
): Promise<Playlist> {
  const supabase = await createClient()
  return updatePlaylistApi(supabase, playlistId, updates)
}

export async function deletePlaylistAction(playlistId: string): Promise<void> {
  const supabase = await createClient()
  return deletePlaylistApi(supabase, playlistId)
}

export async function addSongToPlaylistAction(
  playlistId: string,
  songId: string,
  position?: number
): Promise<void> {
  const supabase = await createClient()
  return addSongToPlaylistApi(supabase, playlistId, songId, position)
}

export async function removeSongFromPlaylistAction(
  playlistId: string,
  songId: string
): Promise<void> {
  const supabase = await createClient()
  return removeSongFromPlaylistApi(supabase, playlistId, songId)
}

export async function reorderPlaylistSongsAction(
  playlistId: string,
  updates: Array<{ songId: string; position: number }>
): Promise<void> {
  const supabase = await createClient()
  return reorderPlaylistSongsApi(supabase, playlistId, updates)
}
