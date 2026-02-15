import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  addSongToPlaylist as addSongToPlaylistApi,
  createPlaylist as createPlaylistApi,
  deletePlaylist as deletePlaylistApi,
  removeSongFromPlaylist as removeSongFromPlaylistApi,
  reorderPlaylistSongs as reorderPlaylistSongsApi,
  updatePlaylist as updatePlaylistApi
} from "../playlistsApi"
import {
  addSongToPlaylistAction,
  createPlaylistAction,
  deletePlaylistAction,
  removeSongFromPlaylistAction,
  reorderPlaylistSongsAction,
  updatePlaylistAction
} from "../actions"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("../playlistsApi", () => ({
  createPlaylist: jest.fn(),
  updatePlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
  addSongToPlaylist: jest.fn(),
  removeSongFromPlaylist: jest.fn(),
  reorderPlaylistSongs: jest.fn()
}))

describe("playlist actions", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("creates a playlist and revalidates playlist list", async () => {
    const playlistData = { name: "Setlist", songs: ["song-1"], visibility: "public" as const }
    const createdPlaylist = {
      id: "playlist-1",
      ...playlistData,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
    ;(createPlaylistApi as jest.Mock).mockResolvedValue(createdPlaylist)

    const result = await createPlaylistAction(playlistData, "user-1")

    expect(result).toEqual(createdPlaylist)
    expect(createPlaylistApi).toHaveBeenCalledWith(mockSupabase, playlistData, "user-1")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("updates a playlist and revalidates list and detail routes", async () => {
    const updatedPlaylist = {
      id: "playlist-1",
      name: "Updated",
      songs: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z"
    }
    ;(updatePlaylistApi as jest.Mock).mockResolvedValue(updatedPlaylist)

    const result = await updatePlaylistAction("playlist-1", { name: "Updated" })

    expect(result).toEqual(updatedPlaylist)
    expect(updatePlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", { name: "Updated" })
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/dashboard/playlists")
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/dashboard/playlists/playlist-1")
  })

  it("deletes a playlist and revalidates playlist list", async () => {
    await deletePlaylistAction("playlist-2")

    expect(deletePlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-2")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("adds a song to a playlist and revalidates detail route", async () => {
    await addSongToPlaylistAction("playlist-1", "song-1", 2)

    expect(addSongToPlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", "song-1", 2)
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists/playlist-1")
  })

  it("removes a song from a playlist and revalidates detail route", async () => {
    await removeSongFromPlaylistAction("playlist-1", "song-2")

    expect(removeSongFromPlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", "song-2")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists/playlist-1")
  })

  it("reorders songs in a playlist and revalidates detail route", async () => {
    const updates = [
      { songId: "song-1", position: 0 },
      { songId: "song-2", position: 1 }
    ]

    await reorderPlaylistSongsAction("playlist-1", updates)

    expect(reorderPlaylistSongsApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", updates)
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists/playlist-1")
  })
})
