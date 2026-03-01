import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createSong as createSongApi, deleteSong as deleteSongApi, updateSong as updateSongApi } from "../songsApi"
import { createSongAction, deleteSongAction, updateSongAction } from "../actions"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}))

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

jest.mock("../songsApi", () => ({
  createSong: jest.fn(),
  updateSong: jest.fn(),
  deleteSong: jest.fn()
}))

describe("song actions", () => {
  const mockSupabase = { id: "supabase-client" }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it("creates a song and revalidates songs page", async () => {
    const song = {
      id: "song-1",
      title: "Amazing Grace",
      artist: "Traditional",
      key: "C",
      bpm: 120,
      lyrics: "",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
    ;(createSongApi as jest.Mock).mockResolvedValue(song)

    const result = await createSongAction({ title: "Amazing Grace" }, "user-1")

    expect(result).toEqual(song)
    expect(createSongApi).toHaveBeenCalledWith(mockSupabase, { title: "Amazing Grace" }, "user-1")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/songs")
  })

  it("updates a song without revalidating routes", async () => {
    const updatedSong = {
      id: "song-1",
      title: "Updated Song",
      artist: "",
      key: "",
      bpm: 0,
      lyrics: "",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z"
    }
    ;(updateSongApi as jest.Mock).mockResolvedValue(updatedSong)

    const result = await updateSongAction("song-1", { title: "Updated Song" })

    expect(result).toEqual(updatedSong)
    expect(updateSongApi).toHaveBeenCalledWith(mockSupabase, "song-1", { title: "Updated Song" })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("deletes a song and revalidates songs list route", async () => {
    await deleteSongAction("song-4")

    expect(deleteSongApi).toHaveBeenCalledWith(mockSupabase, "song-4")
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/songs")
  })
})
