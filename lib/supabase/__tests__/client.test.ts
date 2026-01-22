/**
 * Tests for Supabase client-side client
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn()
}))

describe("Supabase Client", () => {
  const originalEnv = process.env
  const mockClient = { auth: {}, from: jest.fn() }

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    const { createBrowserClient } = require("@supabase/ssr")
    createBrowserClient.mockReturnValue(mockClient)
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe("createClient", () => {
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "test-google-client-id",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: "test-google-secret"
    }

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
      Object.entries(requiredEnvVars).forEach(([key, value]) => {
        process.env[key] = value
      })
      const { createBrowserClient } = require("@supabase/ssr")
      createBrowserClient.mockReturnValue(mockClient)
    })

    afterEach(() => {
      process.env = originalEnv
      jest.clearAllMocks()
    })

    it("should create a client with valid environment variables", () => {
      const { createClient } = require("@/lib/supabase/client")
      const { createBrowserClient } = require("@supabase/ssr")
      const client = createClient()

      expect(createBrowserClient).toHaveBeenCalledWith("https://test.supabase.co", "test-key")
      expect(client).toBe(mockClient)
    })

    it("should use singleton pattern and return same client instance", () => {
      const { createClient } = require("@/lib/supabase/client")
      const { createBrowserClient } = require("@supabase/ssr")
      const client1 = createClient()
      const client2 = createClient()

      expect(client1).toBe(client2)
      expect(createBrowserClient).toHaveBeenCalledTimes(1)
    })

    it("should throw error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key"
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID = "test-google-client-id"
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "test-google-secret"

      expect(() => require("@/lib/supabase/client")).toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file."
      )
    })

    it("should throw error when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID = "test-google-client-id"
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "test-google-secret"

      expect(() => require("@/lib/supabase/client")).toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable. Please add it to your .env.local file."
      )
    })

    it("should throw error when both environment variables are missing", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID = "test-google-client-id"
      process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "test-google-secret"

      expect(() => require("@/lib/supabase/client")).toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env.local file."
      )
    })
  })
})
