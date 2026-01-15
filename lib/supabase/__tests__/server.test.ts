/**
 * Tests for Supabase server-side client
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn()
}))

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn()
}))

describe("Supabase Server Client", () => {
  const originalEnv = process.env
  const mockClient = { auth: {}, from: jest.fn() }
  const mockCookieStore = {
    getAll: jest.fn(() => [] as Array<{ name: string; value: string }>),
    set: jest.fn()
  }

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    const { createServerClient } = require("@supabase/ssr")
    const { cookies } = require("next/headers")
    createServerClient.mockReturnValue(mockClient)
    cookies.mockResolvedValue(mockCookieStore)
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe("createClient", () => {
    it("should create a server client with valid environment variables", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

      const { createClient } = require("@/lib/supabase/server")
      const { createServerClient } = require("@supabase/ssr")
      const { cookies } = require("next/headers")
      const client = await createClient()

      expect(cookies).toHaveBeenCalled()
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
      expect(client).toBe(mockClient)
    })

    it("should handle cookie getAll correctly", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

      const { createClient } = require("@/lib/supabase/server")
      const { createServerClient } = require("@supabase/ssr")
      const mockCookies = [{ name: "test", value: "value" }]
      mockCookieStore.getAll.mockReturnValue(mockCookies)

      await createClient()

      const cookiesConfig = createServerClient.mock.calls[0][2].cookies
      const result = cookiesConfig.getAll()

      expect(result).toEqual(mockCookies)
    })

    it("should handle cookie setAll correctly", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

      const { createClient } = require("@/lib/supabase/server")
      await createClient()

      const { createServerClient } = require("@supabase/ssr")
      const cookiesConfig = createServerClient.mock.calls[0][2].cookies
      const cookiesToSet = [
        { name: "cookie1", value: "value1", options: { httpOnly: true } },
        { name: "cookie2", value: "value2", options: { secure: true } }
      ]

      cookiesConfig.setAll(cookiesToSet)

      expect(mockCookieStore.set).toHaveBeenCalledTimes(2)
      expect(mockCookieStore.set).toHaveBeenCalledWith("cookie1", "value1", { httpOnly: true })
      expect(mockCookieStore.set).toHaveBeenCalledWith("cookie2", "value2", { secure: true })
    })

    it("should handle setAll errors gracefully", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

      const { createClient } = require("@/lib/supabase/server")
      mockCookieStore.set.mockImplementation(() => {
        throw new Error("Cannot set cookie in Server Component")
      })

      await createClient()

      const { createServerClient } = require("@supabase/ssr")
      const cookiesConfig = createServerClient.mock.calls[0][2].cookies
      const cookiesToSet = [{ name: "cookie1", value: "value1", options: {} }]

      // Should not throw
      expect(() => cookiesConfig.setAll(cookiesToSet)).not.toThrow()
    })

    it("should throw error when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"

      const { createClient } = require("@/lib/supabase/server")
      await expect(createClient()).rejects.toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file."
      )
    })

    it("should throw error when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

      const { createClient } = require("@/lib/supabase/server")
      await expect(createClient()).rejects.toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable. Please add it to your .env.local file."
      )
    })
  })
})
