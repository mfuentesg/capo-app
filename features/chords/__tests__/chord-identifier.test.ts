import { identifyChord, getNotesFromFrets, NOTE_NAMES } from "../utils/chord-identifier"

describe("chord-identifier", () => {
  describe("identifyChord", () => {
    it("returns empty array when no strings are played", () => {
      const result = identifyChord([-1, -1, -1, -1, -1, -1])
      expect(result).toEqual([])
    })

    it("returns empty array with only one distinct note", () => {
      // All strings muted except low E open = E
      const result = identifyChord([0, -1, -1, -1, -1, -1])
      expect(result).toEqual([])
    })

    it("identifies an open E major chord", () => {
      // Standard open E: 0 2 2 1 0 0 (low E to high E)
      const result = identifyChord([0, 2, 2, 1, 0, 0])
      expect(result.length).toBeGreaterThan(0)
      const topResult = result[0]
      expect(topResult.root).toBe("E")
      expect(topResult.suffix).toBe("major")
      expect(topResult.confidence).toBe("exact")
    })

    it("identifies an open A minor chord", () => {
      // Open Am: -1 0 2 2 1 0
      const result = identifyChord([-1, 0, 2, 2, 1, 0])
      expect(result.length).toBeGreaterThan(0)
      const topResult = result[0]
      expect(topResult.root).toBe("A")
      expect(topResult.suffix).toBe("minor")
      expect(topResult.confidence).toBe("exact")
    })

    it("identifies an open G major chord", () => {
      // Open G: 3 2 0 0 0 3
      const result = identifyChord([3, 2, 0, 0, 0, 3])
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].root).toBe("G")
    })

    it("identifies a D major chord", () => {
      // Open D: -1 -1 0 2 3 2
      const result = identifyChord([-1, -1, 0, 2, 3, 2])
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].root).toBe("D")
      expect(result[0].suffix).toBe("major")
    })

    it("places exact matches before partial matches", () => {
      const result = identifyChord([0, 2, 2, 1, 0, 0])
      const exactIndex = result.findIndex((r) => r.confidence === "exact")
      const partialIndex = result.findIndex((r) => r.confidence === "partial")
      if (exactIndex !== -1 && partialIndex !== -1) {
        expect(exactIndex).toBeLessThan(partialIndex)
      }
    })

    it("deduplicates results by name", () => {
      const result = identifyChord([0, 2, 2, 1, 0, 0])
      const names = result.map((r) => r.name)
      const uniqueNames = new Set(names)
      expect(names.length).toBe(uniqueNames.size)
    })

    it("respects baseFret offset", () => {
      // Standard barre F major at fret 1: low E→1, A→3, D→3, G→2, B→1, high E→1
      // Notes: F, C, F, A, C, F → F, A, C = F major
      const resultBase1 = identifyChord([1, 3, 3, 2, 1, 1], 1)
      expect(resultBase1.length).toBeGreaterThan(0)
      expect(resultBase1[0].root).toBe("F")
    })
  })

  describe("getNotesFromFrets", () => {
    it("returns empty array when all strings are muted", () => {
      const notes = getNotesFromFrets([-1, -1, -1, -1, -1, -1])
      expect(notes).toEqual([])
    })

    it("returns unique notes", () => {
      // Open E major has E, B, G# but some repeated across strings
      const notes = getNotesFromFrets([0, 2, 2, 1, 0, 0])
      const unique = new Set(notes)
      expect(notes.length).toBe(unique.size)
    })

    it("returns E for open low E string", () => {
      const notes = getNotesFromFrets([0, -1, -1, -1, -1, -1])
      expect(notes).toContain("E")
    })

    it("returns NOTE_NAMES values only", () => {
      const notes = getNotesFromFrets([0, 2, 2, 1, 0, 0])
      notes.forEach((n) => expect(NOTE_NAMES).toContain(n))
    })
  })
})
