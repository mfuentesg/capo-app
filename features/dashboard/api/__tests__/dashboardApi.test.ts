import { applyContextFilter } from "@/lib/supabase/apply-context-filter"
import { getDashboardStats, getRecentSongs } from "../dashboardApi"

jest.mock("@/lib/supabase/apply-context-filter", () => ({
  applyContextFilter: jest.fn((query: unknown) => query)
}))

describe("dashboard api", () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it("fetches dashboard stats with context filters and fallback counts", async () => {
    const songsCountQuery = Promise.resolve({ count: 12 })
    const playlistsCountQuery = Promise.resolve({ count: 4 })
    const songsThisMonthGte = jest.fn().mockResolvedValue({ count: null })
    const upcomingGte = jest.fn().mockResolvedValue({ count: 2 })

    const from = jest
      .fn()
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue(songsCountQuery)
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue(playlistsCountQuery)
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          gte: songsThisMonthGte
        })
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          gte: upcomingGte
        })
      })

    const supabase = { from }
    const context = { type: "team" as const, teamId: "team-1", userId: "user-1" }

    const result = await getDashboardStats(supabase as never, context)

    expect(from).toHaveBeenNthCalledWith(1, "songs")
    expect(from).toHaveBeenNthCalledWith(2, "playlists")
    expect(from).toHaveBeenNthCalledWith(3, "songs")
    expect(from).toHaveBeenNthCalledWith(4, "playlists")
    expect(songsThisMonthGte).toHaveBeenCalledWith("created_at", expect.any(String))
    expect(upcomingGte).toHaveBeenCalledWith("date", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
    expect(applyContextFilter).toHaveBeenCalledTimes(4)
    expect(result).toEqual({
      totalSongs: 12,
      totalPlaylists: 4,
      songsThisMonth: 0,
      upcomingPlaylists: 2
    })
  })

  it("fetches recent songs, formats relative time labels, and applies defaults", async () => {
    const now = new Date("2026-02-15T12:00:00.000Z")
    jest.useFakeTimers().setSystemTime(now)

    const minutesAgo = (value: number) => new Date(now.getTime() - value * 60_000).toISOString()
    const hoursAgo = (value: number) => new Date(now.getTime() - value * 3_600_000).toISOString()
    const daysAgo = (value: number) => new Date(now.getTime() - value * 86_400_000).toISOString()

    const data = [
      { id: "s1", title: "Now", created_at: now.toISOString(), artist: null, key: null, bpm: null },
      { id: "s2", title: "One minute", created_at: minutesAgo(1), artist: "A", key: "C", bpm: 100 },
      { id: "s3", title: "Many minutes", created_at: minutesAgo(5), artist: "A", key: "C", bpm: 100 },
      { id: "s4", title: "One hour", created_at: hoursAgo(1), artist: "A", key: "C", bpm: 100 },
      { id: "s5", title: "Many hours", created_at: hoursAgo(3), artist: "A", key: "C", bpm: 100 },
      { id: "s6", title: "Yesterday", created_at: daysAgo(1), artist: "A", key: "C", bpm: 100 },
      { id: "s7", title: "Days", created_at: daysAgo(3), artist: "A", key: "C", bpm: 100 },
      { id: "s8", title: "One week", created_at: daysAgo(8), artist: "A", key: "C", bpm: 100 },
      { id: "s9", title: "Weeks", created_at: daysAgo(21), artist: "A", key: "C", bpm: 100 },
      { id: "s10", title: "One month", created_at: daysAgo(45), artist: "A", key: "C", bpm: 100 },
      { id: "s11", title: "Months", created_at: daysAgo(90), artist: "A", key: "C", bpm: 100 }
    ]

    const limit = jest.fn().mockResolvedValue({ data, error: null })
    const order = jest.fn().mockReturnValue({ limit })
    const filteredQuery = { order }
    const select = jest.fn().mockReturnValue(filteredQuery)
    const from = jest.fn().mockReturnValue({ select })
    const supabase = { from }
    const context = { type: "personal" as const, userId: "user-1" }

    const songs = await getRecentSongs(supabase as never, context, 20)

    expect(from).toHaveBeenCalledWith("songs")
    expect(select).toHaveBeenCalledWith("id, title, artist, key, bpm, created_at")
    expect(applyContextFilter).toHaveBeenCalledWith(filteredQuery, context)
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false })
    expect(limit).toHaveBeenCalledWith(20)
    expect(songs.map((song) => song.addedAt)).toEqual([
      "just now",
      "1 minute ago",
      "5 minutes ago",
      "1 hour ago",
      "3 hours ago",
      "yesterday",
      "3 days ago",
      "1 week ago",
      "3 weeks ago",
      "1 month ago",
      "3 months ago"
    ])
    expect(songs[0]).toMatchObject({
      id: "s1",
      title: "Now",
      artist: "",
      key: "",
      bpm: 0
    })
  })

  it("uses default recent-song limit when omitted", async () => {
    const limit = jest.fn().mockResolvedValue({ data: [], error: null })
    const query = {
      order: jest.fn().mockReturnValue({ limit })
    }
    const supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(query)
      })
    }

    await getRecentSongs(
      supabase as never,
      { type: "personal", userId: "user-1" } as const
    )

    expect(limit).toHaveBeenCalledWith(5)
  })

  it("throws when recent songs query returns an error", async () => {
    const queryError = new Error("failed to load songs")
    const supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: null, error: queryError })
          })
        })
      })
    }

    await expect(
      getRecentSongs(supabase as never, { type: "personal", userId: "user-1" } as const)
    ).rejects.toThrow("failed to load songs")
  })
})
