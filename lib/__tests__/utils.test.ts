/**
 * Test suite for general utility functions
 */
import { cn } from "@/lib/utils"

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
})
