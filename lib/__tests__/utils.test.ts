/**
 * Test suite for general utility functions
 */
import { cn, parseDateValue, formatDate, formatLongDate, formatDateISO } from "@/lib/utils"

describe("Utility Functions", () => {
  describe("cn (classname merger)", () => {
    it("should merge class names", () => {
      const result = cn("px-2", "py-1")
      expect(result).toContain("px-2")
      expect(result).toContain("py-1")
    })

    it("should handle empty strings", () => {
      const result = cn("px-2", "", "py-1")
      expect(typeof result).toBe("string")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("base", isActive && "active")
      expect(result).toContain("base")
      expect(result).toContain("active")
    })

    it("should handle false conditions", () => {
      const isActive = false
      const result = cn("base", isActive && "active")
      expect(result).toContain("base")
      // Should not contain 'active' or should only have 'base'
      expect(typeof result).toBe("string")
    })

    it("should handle undefined", () => {
      const result = cn("base", undefined)
      expect(typeof result).toBe("string")
    })

    it("should handle arrays of classes", () => {
      const result = cn(["px-2", "py-1"])
      expect(typeof result).toBe("string")
    })
  })

  describe("parseDateValue", () => {
    it("should parse YYYY-MM-DD strings as local calendar dates", () => {
      const parsed = parseDateValue("2026-02-16")

      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(1) // 0-based
      expect(parsed.getDate()).toBe(16)
    })

    it("should parse a Date object unchanged", () => {
      const date = new Date(2026, 0, 5)
      const parsed = parseDateValue(date)
      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(0)
      expect(parsed.getDate()).toBe(5)
    })

    it("should parse a numeric timestamp", () => {
      const ts = new Date(2026, 5, 15).getTime()
      const parsed = parseDateValue(ts)
      expect(parsed instanceof Date).toBe(true)
    })
  })

  describe("formatDate", () => {
    it("returns a locale date string for a YYYY-MM-DD input", () => {
      const result = formatDate("2026-03-08")
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("returns a locale date string for a Date object", () => {
      const date = new Date(2026, 2, 8)
      const result = formatDate(date)
      expect(typeof result).toBe("string")
    })
  })

  describe("formatLongDate", () => {
    it("formats a date as a long date string in English", () => {
      const result = formatLongDate("2026-03-08", "en")
      expect(typeof result).toBe("string")
      expect(result).toMatch(/2026/)
    })

    it("formats a date as a long date string in Spanish", () => {
      const result = formatLongDate("2026-03-08", "es")
      expect(typeof result).toBe("string")
      expect(result).toMatch(/2026/)
    })

    it("defaults to English locale when no locale provided", () => {
      const result = formatLongDate("2026-03-08")
      expect(typeof result).toBe("string")
      expect(result).toMatch(/2026/)
    })
  })

  describe("formatDateISO", () => {
    it("formats a date as yyyy-MM-dd", () => {
      const date = new Date(2026, 2, 8) // March 8 2026 (local)
      const result = formatDateISO(date)
      expect(result).toBe("2026-03-08")
    })

    it("pads single-digit month and day with zeros", () => {
      const date = new Date(2026, 0, 5) // January 5
      const result = formatDateISO(date)
      expect(result).toBe("2026-01-05")
    })
  })
})
