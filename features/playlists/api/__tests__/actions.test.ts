import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  getPlaylists as getPlaylistsApi,
  getPlaylistsAllBuckets as getPlaylistsAllBucketsApi,
  getPlaylistWithSongs as getPlaylistWithSongsApi,
  addSongToPlaylist as addSongToPlaylistApi,
  addSongsToPlaylist as addSongsToPlaylistApi,
  createPlaylist as createPlaylistApi,
  deletePlaylist as deletePlaylistApi,
  removeSongFromPlaylist as removeSongFromPlaylistApi,
  reorderPlaylistSongs as reorderPlaylistSongsApi,
  updatePlaylist as updatePlaylistApi
} from "../playlistsApi"
import {
  getPlaylistsAction,
  getPlaylistsAllBucketsAction,
  getPlaylistWithSongsAction,
  addSongToPlaylistAction,
  addSongsToPlaylistAction,
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
  getPlaylists: jest.fn(),
  getPlaylistsAllBuckets: jest.fn(),
  getPlaylistWithSongs: jest.fn(),
  createPlaylist: jest.fn(),
  updatePlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
  addSongToPlaylist: jest.fn(),
  addSongsToPlaylist: jest.fn(),
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
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("updates a playlist with shareCode and revalidates shared route", async () => {
    const updatedPlaylist = {
      id: "playlist-1",
      name: "Updated",
      songs: [],
      shareCode: "ABC123",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z"
    }
    ;(updatePlaylistApi as jest.Mock).mockResolvedValue(updatedPlaylist)

    await updatePlaylistAction("playlist-1", { name: "Updated" })

    expect(revalidatePath).toHaveBeenCalledWith("/shared/ABC123")
  })

  it("deletes a playlist and revalidates playlist list", async () => {
    await deletePlaylistAction("playlist-2")

    expect(deletePlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-2")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("adds a song to a playlist and revalidates playlist list", async () => {
    await addSongToPlaylistAction("playlist-1", "song-1")

    expect(addSongToPlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", "song-1")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("removes a song from a playlist and revalidates playlist list", async () => {
    await removeSongFromPlaylistAction("playlist-1", "song-2")

    expect(removeSongFromPlaylistApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", "song-2")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })

  it("reorders songs in a playlist without shareCode and skips shared revalidation", async () => {
    const updates = [
      { songId: "song-1", position: 0 },
      { songId: "song-2", position: 1 }
    ]

    await reorderPlaylistSongsAction("playlist-1", updates)

    expect(reorderPlaylistSongsApi).toHaveBeenCalledWith(mockSupabase, "playlist-1", updates)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("reorders songs in a playlist with shareCode and revalidates shared route", async () => {
    const updates = [
      { songId: "song-1", position: 0 },
      { songId: "song-2", position: 1 }
    ]

    await reorderPlaylistSongsAction("playlist-1", updates, "SHARE123")

    expect(revalidatePath).toHaveBeenCalledWith("/shared/SHARE123")
  })
})

describe("getPlaylistsAction", () => {
  const mockSupabase = { id: "supabase-client" }
  const context = { type: "personal" as const, userId: "user-1" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("fetches playlists for the given context", async () => {
    const playlists = [{ id: "p-1", name: "Setlist" }]
    ;(getPlaylistsApi as jest.Mock).mockResolvedValue(playlists)

    const result = await getPlaylistsAction(context)

    expect(getPlaylistsApi).toHaveBeenCalledWith(mockSupabase, context)
    expect(result).toEqual(playlists)
  })
})

describe("getPlaylistsAllBucketsAction", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("fetches playlists across all buckets for a user", async () => {
    const playlists = [{ id: "p-2", name: "All Songs" }]
    ;(getPlaylistsAllBucketsApi as jest.Mock).mockResolvedValue(playlists)

    const result = await getPlaylistsAllBucketsAction("user-1", ["team-1"])

    expect(getPlaylistsAllBucketsApi).toHaveBeenCalledWith(mockSupabase, "user-1", ["team-1"])
    expect(result).toEqual(playlists)
  })
})

describe("getPlaylistWithSongsAction", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("fetches a single playlist with its songs", async () => {
    const playlist = { id: "p-1", name: "Setlist", songs: [] }
    ;(getPlaylistWithSongsApi as jest.Mock).mockResolvedValue(playlist)

    const result = await getPlaylistWithSongsAction("p-1")

    expect(getPlaylistWithSongsApi).toHaveBeenCalledWith(mockSupabase, "p-1")
    expect(result).toEqual(playlist)
  })
})

describe("addSongsToPlaylistAction", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("adds multiple songs to a playlist and revalidates playlists route", async () => {
    await addSongsToPlaylistAction("p-1", ["song-1", "song-2"])

    expect(addSongsToPlaylistApi).toHaveBeenCalledWith(mockSupabase, "p-1", ["song-1", "song-2"])
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/playlists")
  })
})
