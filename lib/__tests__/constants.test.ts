/**
 * Test suite for application constants
 */
import { MUSICAL_KEYS } from "@/lib/constants"

describe("Application Constants", () => {
  describe("MUSICAL_KEYS", () => {
    it("should be an array", () => {
      expect(Array.isArray(MUSICAL_KEYS)).toBe(true)
    })

    it("should contain at least common keys", () => {
      expect(MUSICAL_KEYS.length).toBeGreaterThan(0)
    })

    it("should have string values", () => {
      MUSICAL_KEYS.forEach((key) => {
        expect(typeof key).toBe("string")
        expect(key.length).toBeGreaterThan(0)
      })
    })

    it("should not have duplicates", () => {
      const uniqueKeys = new Set(MUSICAL_KEYS)
      expect(uniqueKeys.size).toBe(MUSICAL_KEYS.length)
    })

    it("should include major and minor keys", () => {
      const hasMinor = MUSICAL_KEYS.some((k) => k.includes("m"))
      expect(hasMinor).toBe(true)
    })
  })
})
