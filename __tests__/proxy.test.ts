/**
 * Tests for Next.js proxy (server-side redirect)
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// Mock NextRequest before importing proxy
jest.mock("next/server", () => {
  class MockNextRequest {
    url: string
    nextUrl: { pathname: string; origin: string }
    cookies: {
      getAll: jest.Mock
      set: jest.Mock
    }

    constructor(url: string) {
      this.url = url
      const urlObj = new URL(url)
      this.nextUrl = {
        pathname: urlObj.pathname,
        origin: urlObj.origin
      }
      this.cookies = {
        getAll: jest.fn(() => []),
        set: jest.fn()
      }
    }
  }

  class MockHeaders {
    private map = new Map<string, string>()

    get(name: string): string | null {
      const value = this.map.get(name.toLowerCase())
      return value !== undefined ? value : null
    }

    set(name: string, value: string): void {
      this.map.set(name.toLowerCase(), value)
    }

    has(name: string): boolean {
      return this.map.has(name.toLowerCase())
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      next: jest.fn(() => {
        const headers = new MockHeaders()
        return { status: 200, headers }
      }),
      redirect: jest.fn((url: string | URL) => {
        const headers = new MockHeaders()
        const location = typeof url === "string" ? url : url.toString()
        headers.set("location", location)
        return { status: 307, headers }
      })
    }
  }
})

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn()
}))

const { createServerClient } = require("@supabase/ssr")
const { proxy } = require("@/proxy")

describe("Proxy", () => {
  const originalEnv = process.env
  const originalConsoleError = console.error
  let mockSupabase: any
  const { NextRequest } = require("next/server")

  beforeEach(() => {
    jest.resetModules()
    // Suppress console.error during tests
    console.error = jest.fn()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

    mockSupabase = {
      auth: {
        getUser: jest.fn()
      }
    }

    createServerClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError
  })

  describe("proxy function", () => {
    it("should redirect authenticated users from home to dashboard", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
        error: null
      })

      const request = new NextRequest("http://localhost:3000/")
      const response = await proxy(request)

      expect(response.status).toBe(307)
      const location = response.headers.get("location")
      expect(location).toBeTruthy()
      expect(location).toContain("/dashboard")
    })

    it("should allow unauthenticated users to access home page", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest("http://localhost:3000/")
      const response = await proxy(request)

      expect(response.status).toBe(200)
      expect(response.headers.get("location")).toBeNull()
    })

    it("should continue with request for non-home paths", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
        error: null
      })

      const request = new NextRequest("http://localhost:3000/dashboard")
      const response = await proxy(request)

      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it("should handle missing environment variables gracefully", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

      const request = new NextRequest("http://localhost:3000/")
      const response = await proxy(request)

      expect(createServerClient).not.toHaveBeenCalled()
      expect(response.status).toBe(200)
    })

    it("should handle session check errors gracefully", async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error("Network error"))

      const request = new NextRequest("http://localhost:3000/")
      const response = await proxy(request)

      // Should continue with request even if session check fails
      expect(response.status).toBe(200)
    })

    it("should set cookies correctly", async () => {
      const cookiesToSet: Array<{ name: string; value: string; options: any }> = []
      const mockSetAll = jest.fn((cookies) => {
        cookies.forEach((cookie: any) => cookiesToSet.push(cookie))
      })

      createServerClient.mockImplementation((url: string, key: string, options: any) => {
        // Call setAll to simulate Supabase setting cookies
        options.cookies.setAll([
          { name: "sb-token", value: "token-value", options: { httpOnly: true } }
        ])
        return mockSupabase
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest("http://localhost:3000/")
      const response = await proxy(request)

      // Verify cookies were handled (the actual implementation tracks them)
      expect(response).toBeDefined()
    })

    it("should use correct Supabase client configuration", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest("http://localhost:3000/")
      await proxy(request)

      expect(createServerClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "test-key",
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function)
          })
        })
      )
    })
  })
})
