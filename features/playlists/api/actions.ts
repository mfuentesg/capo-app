"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Playlist } from "../types"
import type { AppContext } from "@/features/app-context"
import {
  getPlaylists as getPlaylistsApi,
  getPlaylistWithSongs as getPlaylistWithSongsApi,
  createPlaylist as createPlaylistApi,
  updatePlaylist as updatePlaylistApi,
  deletePlaylist as deletePlaylistApi,
  addSongToPlaylist as addSongToPlaylistApi,
  removeSongFromPlaylist as removeSongFromPlaylistApi,
  reorderPlaylistSongs as reorderPlaylistSongsApi
} from "./playlistsApi"

export async function getPlaylistsAction(context: AppContext): Promise<Playlist[]> {
  const supabase = await createClient()
  return getPlaylistsApi(supabase, context)
}

export async function getPlaylistWithSongsAction(playlistId: string) {
  const supabase = await createClient()
  return getPlaylistWithSongsApi(supabase, playlistId)
}

export async function createPlaylistAction(
  playlistData: {
    name: string
    description?: string
    date?: string
    songs?: string[]
    visibility?: "private" | "public"
    allowGuestEditing?: boolean
  },
  userId: string,
  context?: AppContext
): Promise<Playlist> {
  const supabase = await createClient()
  const result = context
    ? await createPlaylistApi(supabase, playlistData, userId, context)
    : await createPlaylistApi(supabase, playlistData, userId)
  revalidatePath("/dashboard/playlists")
  return result
}

export async function updatePlaylistAction(
  playlistId: string,
  updates: Partial<Playlist>
): Promise<Playlist> {
  const supabase = await createClient()
  const result = await updatePlaylistApi(supabase, playlistId, updates)
  revalidatePath("/dashboard/playlists")
  if (result.shareCode) {
    revalidatePath(`/shared/${result.shareCode}`)
  }
  return result
}

export async function deletePlaylistAction(playlistId: string): Promise<void> {
  const supabase = await createClient()
  await deletePlaylistApi(supabase, playlistId)
  revalidatePath("/dashboard/playlists")
}

export async function addSongToPlaylistAction(
  playlistId: string,
  songId: string
): Promise<void> {
  const supabase = await createClient()
  await addSongToPlaylistApi(supabase, playlistId, songId)
  revalidatePath("/dashboard/playlists")
}

export async function removeSongFromPlaylistAction(
  playlistId: string,
  songId: string
): Promise<void> {
  const supabase = await createClient()
  await removeSongFromPlaylistApi(supabase, playlistId, songId)
  revalidatePath("/dashboard/playlists")
}

export async function reorderPlaylistSongsAction(
  playlistId: string,
  updates: Array<{ songId: string; position: number }>,
  shareCode?: string
): Promise<void> {
  const supabase = await createClient()
  await reorderPlaylistSongsApi(supabase, playlistId, updates)
  if (shareCode) {
    revalidatePath(`/shared/${shareCode}`)
  }
}
