import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSongRealtime } from "../use-song-realtime"
import { createClient } from "@/lib/supabase/client"
import { songsKeys } from "../query-keys"

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

describe("useSongRealtime", () => {
  let queryClient: QueryClient
  const mockOn = jest.fn().mockReturnThis()
  const mockSubscribe = jest.fn().mockReturnThis()
  const mockUnsubscribe = jest.fn()
  const mockChannel = jest.fn().mockReturnValue({
    on: mockOn,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    queryClient.invalidateQueries = jest.fn()
    
    ;(createClient as jest.Mock).mockReturnValue({
      channel: mockChannel
    })
    
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it("subscribes to song and settings changes", () => {
    const songId = "test-song-id"
    renderHook(() => useSongRealtime(songId), { wrapper })

    expect(mockChannel).toHaveBeenCalledWith(`song:${songId}`)
    expect(mockOn).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ table: "songs", filter: `id=eq.${songId}` }),
      expect.any(Function)
    )
    expect(mockOn).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ table: "user_song_settings", filter: `song_id=eq.${songId}` }),
      expect.any(Function)
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useSongRealtime("id"), { wrapper })
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it("invalidates cache when song changes", () => {
    const songId = "test-song-id"
    renderHook(() => useSongRealtime(songId), { wrapper })

    // Use find to get the correct callback
    let songCallback: (() => void) | undefined
    type ChannelCall = [string, { table: string }, () => void]
    const calls = mockOn.mock.calls as ChannelCall[]
    
    for (const call of calls) {
      if (call[1].table === "songs") {
        songCallback = call[2]
        break
      }
    }

    songCallback?.()

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: songsKeys.lists()
    })
  })

  it("invalidates cache when user settings change", () => {
    const songId = "test-song-id"
    renderHook(() => useSongRealtime(songId), { wrapper })

    // Use find to get the correct callback
    let settingsCallback: (() => void) | undefined
    type ChannelCall = [string, { table: string }, () => void]
    const calls = mockOn.mock.calls as ChannelCall[]

    for (const call of calls) {
      if (call[1].table === "user_song_settings") {
        settingsCallback = call[2]
        break
      }
    }

    settingsCallback?.()

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: songsKeys.userSettings(songId)
    })
  })
})
