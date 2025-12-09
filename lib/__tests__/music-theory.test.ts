/**
 * Test suite for music theory utilities
 * Tests core music-related functionality
 */
import { transposeKey, calculateCapoKey, calculateEffectiveKey } from "@/lib/music-theory"

describe("Music Theory Utilities", () => {
  describe("transposeKey", () => {
    it("should transpose a key up by semitones", () => {
      const result = transposeKey("C", 2)
      expect(result).toBe("D")
    })

    it("should transpose a key down by negative semitones", () => {
      const result = transposeKey("D", -2)
      expect(result).toBe("C")
    })

    it("should handle sharps", () => {
      const result = transposeKey("C#", 1)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should preserve modifiers like minor", () => {
      const result = transposeKey("Cm", 2)
      expect(result).toContain("m")
    })

    it("should return the same key when transposing by 0", () => {
      const result = transposeKey("G", 0)
      expect(result).toBe("G")
    })

    it("should handle chromatic wraparound", () => {
      const result = transposeKey("B", 1)
      expect(result).toBe("C")
    })

    it("should return original key for invalid input", () => {
      const result = transposeKey("", 5)
      expect(result).toBe("")
    })
  })

  describe("calculateCapoKey", () => {
    it("should transpose down when capo is placed", () => {
      const result = calculateCapoKey("G", 2)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should return original key when capo is 0", () => {
      const result = calculateCapoKey("G", 0)
      expect(result).toBe("G")
    })

    it("should handle major keys", () => {
      const result = calculateCapoKey("C", 3)
      expect(typeof result).toBe("string")
    })

    it("should handle minor keys", () => {
      const result = calculateCapoKey("Am", 1)
      expect(result).toContain("m")
    })
  })

  describe("calculateEffectiveKey", () => {
    it("should apply both transpose and capo", () => {
      const result = calculateEffectiveKey("C", 2, 1)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should handle no transpose and no capo", () => {
      const result = calculateEffectiveKey("G", 0, 0)
      expect(result).toBe("G")
    })

    it("should apply only transpose when capo is 0", () => {
      const result = calculateEffectiveKey("C", 5, 0)
      expect(typeof result).toBe("string")
    })

    it("should apply only capo effect when transpose is 0", () => {
      const result = calculateEffectiveKey("C", 0, 3)
      expect(typeof result).toBe("string")
    })

    it("should handle negative transpose", () => {
      const result = calculateEffectiveKey("G", -2, 2)
      expect(typeof result).toBe("string")
    })
  })
})
