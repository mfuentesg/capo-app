/**
 * Tests for auth hooks
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import React from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSession, useSignInWithGoogle, useSignOut } from "@/features/auth/hooks/use-auth"
import { authKeys, DEFAULT_REDIRECT_PATH, AUTH_CALLBACK_PATH } from "@/lib/supabase/constants"
import { LocaleProvider } from "@/features/settings"

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

// Mock the factory to return a client API
jest.mock("@/lib/supabase/factory", () => ({
  createApi: (module: Record<string, (...args: unknown[]) => Promise<unknown>>) => {
    const api = {} as Record<string, unknown>
    for (const [key, fn] of Object.entries(module)) {
      if (typeof fn === "function") {
        api[key] = (...args: unknown[]) => {
          const { createClient } = require("@/lib/supabase/client")
          const supabase = createClient()
          return (fn as (...args: unknown[]) => Promise<unknown>)(supabase, ...args)
        }
      }
    }
    return api
  },
  isServerSide: () => false,
  isClientSide: () => true
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
      // Ignore if already defined
    }
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn()
      }
    }

    createClient.mockReturnValue(mockSupabase)
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      // eslint-disable-next-line react/no-children-prop
      React.createElement(LocaleProvider, { initialLocale: "en" as const, children }, children)
    )
  }

  describe("useSession", () => {
    it("should fetch session successfully", async () => {
      const mockSession = {
        access_token: "token",
        user: { id: "123", email: "test@example.com" }
      }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSession)
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1)
    })

    it("should handle auth errors gracefully by returning null", async () => {
      const mockError = { message: "Auth session missing" }
      // Auth errors are handled gracefully - they return null instead of throwing
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const { result } = renderHook(() => useSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Auth errors return null session rather than throwing
      expect(result.current.data).toBeNull()
      expect(result.current.isError).toBe(false)
    })

    it("should use correct query key", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      renderHook(() => useSession(), { wrapper })

      await waitFor(() => {
        expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0)
      })

      const queryCache = queryClient.getQueryCache().getAll()
      expect(
        queryCache.some((query) => query.queryKey.toString() === authKeys.session().toString())
      )
    })
  })

  describe("useSignInWithGoogle", () => {
    it("should sign in with Google successfully", async () => {
      const mockOAuthData = { url: "https://accounts.google.com" }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: mockOAuthData,
        error: null
      })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      await result.current.mutateAsync()

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining(AUTH_CALLBACK_PATH)
        }
      })

      const callArgs = mockSupabase.auth.signInWithOAuth.mock.calls[0][0]
      expect(callArgs.options.redirectTo).toContain(encodeURIComponent(DEFAULT_REDIRECT_PATH))
    })

    it("should handle sign in error", async () => {
      const mockError = { message: "OAuth failed" }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError
      })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it("should invalidate session query on success", async () => {
      const mockOAuthData = { url: "https://accounts.google.com" }
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: mockOAuthData,
        error: null
      })

      // Pre-populate session query
      queryClient.setQueryData(authKeys.session(), { access_token: "old-token" })

      const { result } = renderHook(() => useSignInWithGoogle(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Session query should be invalidated
      const queryState = queryClient.getQueryState(authKeys.session())
      expect(queryState?.isInvalidated).toBe(true)
    })
  })

  describe("useSignOut", () => {
    it("should sign out successfully", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
    })

    it("should handle sign out error", async () => {
      const mockError = { message: "Sign out failed" }
      mockSupabase.auth.signOut.mockResolvedValue({
        error: mockError
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it("should clear auth queries on success", async () => {
      // Pre-populate auth queries
      queryClient.setQueryData(authKeys.session(), { access_token: "token" })
      queryClient.setQueryData(authKeys.user(), { id: "123" })

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Auth queries should be removed
      const sessionQuery = queryClient.getQueryCache().find({ queryKey: authKeys.session() })
      const userQuery = queryClient.getQueryCache().find({ queryKey: authKeys.user() })

      expect(sessionQuery).toBeUndefined()
      expect(userQuery).toBeUndefined()
    })

    it("should redirect to login on success", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const { result } = renderHook(() => useSignOut(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })
})
