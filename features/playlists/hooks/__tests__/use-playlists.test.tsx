import React from "react"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { Playlist } from "@/features/playlists/types"
import { playlistsKeys } from "@/features/playlists/hooks/query-keys"
import {
  useUpdatePlaylist,
  useReorderPlaylistSongs,
  useAddSongsToPlaylist
} from "@/features/playlists/hooks/use-playlists"
import {
  updatePlaylistAction,
  reorderPlaylistSongsAction,
  addSongsToPlaylistAction
} from "@/features/playlists/api/actions"
import { useAppContext } from "@/features/app-context"

jest.mock("@/features/playlists/api", () => ({
  api: {
    getPlaylists: jest.fn()
  }
}))

jest.mock("@/features/playlists/api/actions", () => ({
  createPlaylistAction: jest.fn(),
  updatePlaylistAction: jest.fn(),
  deletePlaylistAction: jest.fn(),
  addSongToPlaylistAction: jest.fn(),
  addSongsToPlaylistAction: jest.fn(),
  reorderPlaylistSongsAction: jest.fn()
}))

jest.mock("@/features/settings", () => ({
  useLocale: () => ({
    t: {
      toasts: {
        error: "Something went wrong",
        playlistUpdated: "Playlist updated"
      }
    }
  })
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock("@/features/app-context", () => ({
  useAppContext: jest.fn()
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}))

const mockUseAppContext = useAppContext as jest.Mock
const mockUpdatePlaylistAction = updatePlaylistAction as jest.Mock
const mockReorderPlaylistSongsAction = reorderPlaylistSongsAction as jest.Mock
const mockAddSongsToPlaylistAction = addSongsToPlaylistAction as jest.Mock

const context = { type: "personal" as const, userId: "user-1" }

function makePlaylist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: "playlist-1",
    name: "Original Name",
    description: "Desc",
    songs: ["song-1", "song-2", "song-3"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    visibility: "private",
    ...overrides
  }
}

describe("usePlaylists mutations", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    mockUseAppContext.mockReturnValue({ context })
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it("does not replace cache with an empty list when update runs without prior cache", async () => {
    mockUpdatePlaylistAction.mockResolvedValue(makePlaylist({ name: "Renamed" }))

    const { result } = renderHook(() => useUpdatePlaylist(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        updates: { name: "Renamed" }
      })
    })

    expect(queryClient.getQueryData(playlistsKeys.list(context))).toBeUndefined()
  })

  it("applies server update payload to cached playlists after a successful mutation", async () => {
    const queryKey = playlistsKeys.list(context)
    queryClient.setQueryData<Playlist[]>(queryKey, [makePlaylist()])
    mockUpdatePlaylistAction.mockResolvedValue(
      makePlaylist({
        name: "Renamed",
        updatedAt: "2026-01-02T00:00:00.000Z"
      })
    )

    const { result } = renderHook(() => useUpdatePlaylist(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        updates: { name: "Renamed" }
      })
    })

    expect(queryClient.getQueryData<Playlist[]>(queryKey)?.[0].name).toBe("Renamed")
    expect(queryClient.getQueryData<Playlist[]>(queryKey)?.[0].updatedAt).toBe(
      "2026-01-02T00:00:00.000Z"
    )
  })

  it("adds songs to an existing playlist via bulk action", async () => {
    mockAddSongsToPlaylistAction.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAddSongsToPlaylist(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        songIds: ["song-a", "song-b", "song-c"]
      })
    })

    expect(mockAddSongsToPlaylistAction).toHaveBeenCalledWith("playlist-1", ["song-a", "song-b", "song-c"])
  })

  it("invalidates playlist cache after adding songs to an existing playlist", async () => {
    mockAddSongsToPlaylistAction.mockResolvedValue(undefined)
    const queryKey = playlistsKeys.list(context)
    queryClient.setQueryData<Playlist[]>(queryKey, [makePlaylist()])

    const { result } = renderHook(() => useAddSongsToPlaylist(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ playlistId: "playlist-1", songIds: ["song-a"] })
    })

    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true)
  })

  it("reorders songs using the dedicated reorder action", async () => {
    const queryKey = playlistsKeys.list(context)
    queryClient.setQueryData<Playlist[]>(queryKey, [makePlaylist()])
    mockReorderPlaylistSongsAction.mockResolvedValue(undefined)

    const { result } = renderHook(() => useReorderPlaylistSongs(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        playlistId: "playlist-1",
        sourceIndex: 0,
        destinationIndex: 2,
        currentSongs: ["song-1", "song-2", "song-3"]
      })
    })

    expect(mockReorderPlaylistSongsAction).toHaveBeenCalledWith("playlist-1", [
      { songId: "song-2", position: 0 },
      { songId: "song-3", position: 1 },
      { songId: "song-1", position: 2 }
    ])
    expect(queryClient.getQueryData<Playlist[]>(queryKey)?.[0].songs).toEqual([
      "song-2",
      "song-3",
      "song-1"
    ])
  })
})
