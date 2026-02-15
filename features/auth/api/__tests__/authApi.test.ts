import { getSession, getUser } from "../authApi"

describe("auth api", () => {
  const originalConsoleDebug = console.debug

  beforeEach(() => {
    console.debug = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    console.debug = originalConsoleDebug
  })

  describe("getUser", () => {
    it("returns normalized user info when user exists", async () => {
      const supabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: {
              user: {
                id: "user-1",
                email: "user@example.com",
                user_metadata: {
                  avatar_url: "https://example.com/avatar.png",
                  full_name: "Test User",
                  name: "Test"
                }
              }
            },
            error: null
          })
        }
      }

      const result = await getUser(supabase as never)

      expect(result).toEqual({
        id: "user-1",
        email: "user@example.com",
        avatarUrl: "https://example.com/avatar.png",
        fullName: "Test User",
        displayName: "Test"
      })
    })

    it("returns null for expected auth session errors", async () => {
      const supabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Auth session missing" }
          })
        }
      }

      const result = await getUser(supabase as never)

      expect(result).toBeNull()
    })

    it("returns null and logs when unexpected errors occur", async () => {
      const supabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Database unavailable" }
          })
        }
      }

      const result = await getUser(supabase as never)

      expect(result).toBeNull()
      expect(console.debug).toHaveBeenCalled()
    })

    it("returns null when no user is available", async () => {
      const supabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null
          })
        }
      }

      const result = await getUser(supabase as never)

      expect(result).toBeNull()
    })
  })

  describe("getSession", () => {
    it("returns the current session when available", async () => {
      const session = { access_token: "token-1", user: { id: "user-1" } }
      const supabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session },
            error: null
          })
        }
      }

      const result = await getSession(supabase as never)

      expect(result).toEqual(session)
    })

    it("returns null for expected auth errors", async () => {
      const supabase = {
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null },
            error: { message: "session expired" }
          })
        }
      }

      const result = await getSession(supabase as never)

      expect(result).toBeNull()
    })

    it("returns null and logs when getSession throws", async () => {
      const supabase = {
        auth: {
          getSession: jest.fn().mockRejectedValue(new Error("network failed"))
        }
      }

      const result = await getSession(supabase as never)

      expect(result).toBeNull()
      expect(console.debug).toHaveBeenCalled()
    })
  })
})
