/**
 * Tests for OAuth callback route handler
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

// Mock NextRequest/NextResponse before importing anything that uses them
jest.mock("next/server", () => {
  class MockHeaders {
    private map = new Map<string, string>()

    get(name: string): string | null {
      const value = this.map.get(name)
      return value !== undefined ? value : null
    }
    set(name: string, value: string): void {
      this.map.set(name, value)
    }
  }

  class MockNextRequest {
    url: string
    constructor(url: string) {
      this.url = url
    }
  }

  class MockNextResponse {
    status: number
    headers: MockHeaders

    constructor(status: number, headers: MockHeaders) {
      this.status = status
      this.headers = headers
    }

    static redirect(url: string | URL): MockNextResponse {
      const headers = new MockHeaders()
      headers.set("location", typeof url === "string" ? url : url.toString())
      return new MockNextResponse(307, headers)
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse
  }
})

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn()
}))

const { createClient } = require("@/lib/supabase/server")
const { GET } = require("@/app/auth/callback/route")

describe("Auth Callback Route", () => {
  const originalConsoleError = console.error
  const mockSupabase = {
    auth: {
      exchangeCodeForSession: jest.fn()
    }
  }
  const { NextRequest } = require("next/server")

  beforeEach(() => {
    // Suppress console.error during tests
    console.error = jest.fn()
    jest.clearAllMocks()
    createClient.mockResolvedValue(mockSupabase)
  })

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError
  })

  describe("GET handler", () => {
    it("should exchange code for session and redirect to dashboard on success", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

      const request = new NextRequest("http://localhost:3000/auth/callback?code=test-code")
      const response = await GET(request)

      expect(createClient).toHaveBeenCalled()
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("test-code")
      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard")
    })

    it("should redirect to custom next URL if valid", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

      const request = new NextRequest(
        "http://localhost:3000/auth/callback?code=test-code&next=/custom-path"
      )
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/custom-path")
    })

    it("should redirect to dashboard if next URL is invalid", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

      const request = new NextRequest(
        "http://localhost:3000/auth/callback?code=test-code&next=http://evil.com"
      )
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard")
    })

    it("should redirect to login with error when exchange fails", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: "Invalid code" }
      })

      const request = new NextRequest("http://localhost:3000/auth/callback?code=invalid-code")
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/?error=auth_failed")
    })

    it("should redirect to login with error when exception occurs", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockRejectedValue(new Error("Network error"))

      const request = new NextRequest("http://localhost:3000/auth/callback?code=test-code")
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/?error=auth_error")
    })

    it("should redirect to login when code is missing", async () => {
      const request = new NextRequest("http://localhost:3000/auth/callback")
      const response = await GET(request)

      expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled()
      expect(response.headers.get("location")).toBe("http://localhost:3000/?error=missing_code")
    })

    it("should validate relative paths as valid redirects", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

      const request = new NextRequest(
        "http://localhost:3000/auth/callback?code=test-code&next=/dashboard/settings"
      )
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard/settings")
    })

    it("should reject absolute URLs from different origins", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

      const request = new NextRequest(
        "http://localhost:3000/auth/callback?code=test-code&next=https://evil.com/steal"
      )
      const response = await GET(request)

      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard")
    })
  })
})
