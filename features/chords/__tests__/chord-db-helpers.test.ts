import { getAllChords, searchChords, getChordsByKey, getAvailableKeys, keyLabel } from "../utils/chord-db-helpers"

describe("chord-db-helpers", () => {
  describe("getAvailableKeys", () => {
    it("returns a non-empty array of key names", () => {
      const keys = getAvailableKeys()
      expect(keys.length).toBeGreaterThan(0)
    })

    it("includes common keys", () => {
      const keys = getAvailableKeys()
      expect(keys).toContain("A")
      expect(keys).toContain("C")
      expect(keys).toContain("G")
    })
  })

  describe("getAllChords", () => {
    it("returns a non-empty flat list of chord entries", () => {
      const chords = getAllChords()
      expect(chords.length).toBeGreaterThan(100)
    })

    it("each entry has key, suffix, name and at least one position", () => {
      const chords = getAllChords()
      for (const chord of chords.slice(0, 20)) {
        expect(chord.key).toBeTruthy()
        expect(chord.suffix).toBeTruthy()
        expect(chord.name).toBeTruthy()
        expect(chord.positions.length).toBeGreaterThan(0)
      }
    })

    it("generates display name without suffix for major chords", () => {
      const chords = getAllChords()
      const cMajor = chords.find((c) => c.key === "C" && c.suffix === "major")
      expect(cMajor).toBeDefined()
      expect(cMajor?.name).toBe("C")
    })

    it("generates display name with suffix for non-major chords", () => {
      const chords = getAllChords()
      const aMinor = chords.find((c) => c.key === "A" && c.suffix === "minor")
      expect(aMinor).toBeDefined()
      expect(aMinor?.name).toBe("Aminor")
    })

    it("uses keyLabel in names so C# chords display as 'C#' not 'Csharp'", () => {
      const chords = getAllChords()
      const csharpMajor = chords.find((c) => c.key === "Csharp" && c.suffix === "major")
      expect(csharpMajor?.name).toBe("C#")
      const csharpMinor = chords.find((c) => c.key === "Csharp" && c.suffix === "minor")
      expect(csharpMinor?.name).toBe("C#minor")
    })
  })

  describe("searchChords", () => {
    it("returns all chords for an empty query", () => {
      const all = getAllChords()
      const results = searchChords("")
      expect(results.length).toBe(all.length)
    })

    it("filters by chord name (case-insensitive)", () => {
      const results = searchChords("am")
      expect(results.length).toBeGreaterThan(0)
      results.forEach((c) => {
        expect(c.name.toLowerCase()).toContain("am")
      })
    })

    it("filters by key", () => {
      // Search "Gmaj7" to ensure key-based filtering works without false suffix matches
      const results = searchChords("Gmaj7")
      expect(results.length).toBeGreaterThan(0)
      results.forEach((c) => {
        expect(c.name.toLowerCase()).toContain("gmaj7")
      })
    })

    it("returns empty array for unknown query", () => {
      const results = searchChords("xyzunknownchord999")
      expect(results).toEqual([])
    })

    it("finds C# chords when searching 'C#'", () => {
      const results = searchChords("C#")
      expect(results.length).toBeGreaterThan(0)
      // C# root chords must be included
      expect(results.some((c) => c.key === "Csharp")).toBe(true)
    })

    it("finds F# chords when searching 'F#'", () => {
      const results = searchChords("F#")
      expect(results.length).toBeGreaterThan(0)
      // F# root chords must be included
      expect(results.some((c) => c.key === "Fsharp")).toBe(true)
    })
  })

  describe("getChordsByKey", () => {
    it("returns chords for key A", () => {
      const chords = getChordsByKey("A")
      expect(chords.length).toBeGreaterThan(0)
      chords.forEach((c) => expect(c.key).toBe("A"))
    })

    it("returns empty array for unknown key", () => {
      const chords = getChordsByKey("ZZZ")
      expect(chords).toEqual([])
    })
  })

  describe("keyLabel", () => {
    it("converts 'Csharp' to 'C#'", () => {
      expect(keyLabel("Csharp")).toBe("C#")
    })

    it("leaves 'Bb' unchanged", () => {
      expect(keyLabel("Bb")).toBe("Bb")
    })

    it("leaves 'A' unchanged", () => {
      expect(keyLabel("A")).toBe("A")
    })
  })
})
