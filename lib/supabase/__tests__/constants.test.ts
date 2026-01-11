/**
 * Tests for Supabase auth constants
 */
import { AUTH_CALLBACK_PATH, DEFAULT_REDIRECT_PATH, LOGIN_PATH, authKeys } from "@/lib/supabase/constants"

describe("Supabase Constants", () => {
  describe("Path constants", () => {
    it("should have correct AUTH_CALLBACK_PATH", () => {
      expect(AUTH_CALLBACK_PATH).toBe("/auth/callback")
    })

    it("should have correct DEFAULT_REDIRECT_PATH", () => {
      expect(DEFAULT_REDIRECT_PATH).toBe("/dashboard")
    })

    it("should have correct LOGIN_PATH", () => {
      expect(LOGIN_PATH).toBe("/")
    })
  })

  describe("authKeys query key factory", () => {
    it("should have correct base key", () => {
      expect(authKeys.all).toEqual(["auth"])
    })

    it("should generate session key correctly", () => {
      expect(authKeys.session()).toEqual(["auth", "session"])
    })

    it("should generate user key correctly", () => {
      expect(authKeys.user()).toEqual(["auth", "user"])
    })

    it("should return immutable arrays", () => {
      const sessionKey = authKeys.session()
      const userKey = authKeys.user()

      expect(sessionKey).not.toBe(userKey)
      expect(sessionKey).toEqual(["auth", "session"])
      expect(userKey).toEqual(["auth", "user"])
    })
  })
})

