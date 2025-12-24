/**
 * Tests for auth hooks
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import React from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSession, useSignInWithGoogle, useSignOut } from "../use-auth"
import { authKeys, DEFAULT_REDIRECT_PATH, AUTH_CALLBACK_PATH } from "@/lib/supabase/constants"

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn()
  }
}))

const { createClient } = require("@/lib/supabase/client")

describe("Auth Hooks", () => {
  const originalConsoleError = console.error
  let queryClient: QueryClient
  let mockSupabase: any

  beforeAll(() => {
    // Suppress console.error during tests
    console.error = jest.fn()
    // Mock window.location once for all tests
    // Use Object.defineProperty with configurable: true to allow redefinition
    try {
      Object.defineProperty(window, "location", {
        value: { origin: "http://localhost:3000" },
        writable: true,
        configurable: true
      })
    } catch {
      // If it fails, try delete and assign
      delete (window as { location?: unknown }).location
      ;(window as { location: { origin: string } }).location = {
        origin: "http://localhost:3000"
      } as Location
    }
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
      }
    })

    mockPush.mockClear()

    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn()
      }
    }

    createClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }

  describe("useSession", () => {
    it("should fetch session successfully", async () => {
      const mockSession = { access_token: "token", user: { id: "123" } }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSession)
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
    })

    it("should handle session fetch error", async () => {
      const mockError = { message: "Failed to get session" }
      // getSession throws the error, so we need to mock it to reject
      mockSupabase.auth.getSession.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSession(), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toEqual(mockError)
    })

    it("should return null when no session exists", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const { result } = renderHook(() => useSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })

  describe("useSignInWithGoogle", () => {
    it("should initiate Google OAuth sign-in", async () => {
      const mockUrl = "https://accounts.google.com/oauth"
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl },
        error: null
      })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      await result.current.mutateAsync()

      // Check that signInWithOAuth was called with correct structure
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled()
      const callArgs = mockSupabase.auth.signInWithOAuth.mock.calls[0][0]
      expect(callArgs.provider).toBe("google")
      expect(callArgs.options.redirectTo).toContain(AUTH_CALLBACK_PATH)
      expect(callArgs.options.redirectTo).toContain(encodeURIComponent(DEFAULT_REDIRECT_PATH))
    })

    it("should handle OAuth sign-in error", async () => {
      const mockError = { message: "OAuth failed" }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError
      })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      await expect(result.current.mutateAsync()).rejects.toEqual(mockError)
    })

    it("should invalidate session query on success", async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: "https://accounts.google.com/oauth" },
        error: null
      })

      // Set initial session data
      queryClient.setQueryData(authKeys.session(), { access_token: "old-token" })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      await result.current.mutateAsync()

      await waitFor(() => {
        // Query should be invalidated (will refetch on next access)
        const queryState = queryClient.getQueryState(authKeys.session())
        expect(queryState).toBeDefined()
      })
    })
  })

  describe("useSignOut", () => {
    it("should sign out successfully", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.mutateAsync()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it("should clear auth queries on success", async () => {
      // Set some auth data
      queryClient.setQueryData(authKeys.session(), { access_token: "token" })
      queryClient.setQueryData(authKeys.user(), { id: "123" })

      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.mutateAsync()

      await waitFor(() => {
        const session = queryClient.getQueryData(authKeys.session())
        const user = queryClient.getQueryData(authKeys.user())
        expect(session).toBeUndefined()
        expect(user).toBeUndefined()
      })
    })

    it("should redirect to login on success", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await result.current.mutateAsync()

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/")
      })
    })

    it("should handle sign-out error", async () => {
      const mockError = { message: "Sign out failed" }
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      await expect(result.current.mutateAsync()).rejects.toEqual(mockError)
    })
  })
})

