/**
 * Tests for AuthStateProvider component
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { render, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthStateProvider } from "@/features/auth/contexts/auth-state-provider"
import { authKeys } from "@/lib/supabase/constants"

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

const { createClient } = require("@/lib/supabase/client")

describe("AuthStateProvider", () => {
  let queryClient: QueryClient
  let mockSupabase: any
  let onAuthStateChangeCallback: (event: string, session: any) => void

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    mockSupabase = {
      auth: {
        onAuthStateChange: jest.fn((callback) => {
          onAuthStateChangeCallback = callback
          return {
            data: { subscription: { unsubscribe: jest.fn() } }
          }
        })
      }
    }

    createClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderWithProvider = (children: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthStateProvider>{children}</AuthStateProvider>
      </QueryClientProvider>
    )
  }

  it("should subscribe to auth state changes on mount", () => {
    renderWithProvider(<div>Test</div>)

    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
  })

  it("should update session cache on SIGNED_IN event", async () => {
    const mockSession = { access_token: "token", user: { id: "123" } }

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("SIGNED_IN", mockSession)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    expect(cachedSession).toEqual(mockSession)
  })

  it("should update session cache on TOKEN_REFRESHED event", async () => {
    const mockSession = { access_token: "new-token", user: { id: "123" } }

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("TOKEN_REFRESHED", mockSession)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    expect(cachedSession).toEqual(mockSession)
  })

  it("should clear auth queries on SIGNED_OUT event", async () => {
    // First set some data
    queryClient.setQueryData(authKeys.session(), { access_token: "token" })
    queryClient.setQueryData(authKeys.user(), { id: "123" })

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("SIGNED_OUT", null)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    const cachedUser = queryClient.getQueryData(authKeys.user())

    expect(cachedSession).toBeUndefined()
    expect(cachedUser).toBeUndefined()
  })

  it("should update session cache on USER_UPDATED event with session", async () => {
    const mockSession = { access_token: "token", user: { id: "123", email: "new@email.com" } }

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("USER_UPDATED", mockSession)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    expect(cachedSession).toEqual(mockSession)
  })

  it("should not update session cache on USER_UPDATED event without session", async () => {
    queryClient.setQueryData(authKeys.session(), { access_token: "old-token" })

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("USER_UPDATED", null)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    expect(cachedSession).toEqual({ access_token: "old-token" })
  })

  it("should handle default case and update session", async () => {
    const mockSession = { access_token: "token", user: { id: "123" } }

    renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    onAuthStateChangeCallback("UNKNOWN_EVENT" as any, mockSession)

    const cachedSession = queryClient.getQueryData(authKeys.session())
    expect(cachedSession).toEqual(mockSession)
  })

  it("should unsubscribe on unmount", async () => {
    const mockUnsubscribe = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = renderWithProvider(<div>Test</div>)

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
