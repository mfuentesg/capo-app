import { parseDefinedChords } from "../rendered-song"

describe("parseDefinedChords", () => {
  it("returns an empty map for an empty string", () => {
    expect(parseDefinedChords("").size).toBe(0)
  })

  it("returns an empty map when no define directives are present", () => {
    const lyrics = "[G]Amazing grace\n[C]How sweet the sound"
    expect(parseDefinedChords(lyrics).size).toBe(0)
  })

  it("parses a {define:} directive with frets only", () => {
    const lyrics = "{define: Asus2 base-fret 1 frets 0 0 2 2 0 0}"
    const map = parseDefinedChords(lyrics)
    expect(map.size).toBe(1)
    expect(map.get("Asus2")).toEqual({
      frets: [0, 0, 2, 2, 0, 0],
      fingers: [0, 0, 0, 0, 0, 0],
      baseFret: 1,
      barres: []
    })
  })

  it("parses a {chord:} alias identically to {define:}", () => {
    const lyrics = "{chord: Dm7 base-fret 1 frets x 0 0 2 1 1}"
    const map = parseDefinedChords(lyrics)
    expect(map.size).toBe(1)
    expect(map.get("Dm7")).toEqual({
      frets: [-1, 0, 0, 2, 1, 1],
      fingers: [0, 0, 0, 0, 0, 0],
      baseFret: 1,
      barres: []
    })
  })

  it("converts x and X to -1 (muted)", () => {
    const lyrics = "{define: Am base-fret 1 frets x 0 2 2 1 0}"
    const map = parseDefinedChords(lyrics)
    expect(map.get("Am")?.frets[0]).toBe(-1)
  })

  it("parses base-fret, frets, fingers, and barres", () => {
    const lyrics = "{define: Am11 base-fret 5 frets x 0 2 0 1 0 fingers 0 0 3 0 1 0 barres 2}"
    const map = parseDefinedChords(lyrics)
    expect(map.get("Am11")).toEqual({
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 3, 0, 1, 0],
      baseFret: 5,
      barres: [2]
    })
  })

  it("parses multiple define directives in one lyrics string", () => {
    const lyrics = [
      "{define: Am11 base-fret 5 frets x 0 2 0 1 0}",
      "{define: Cmaj7 base-fret 1 frets x 3 2 0 0 0}",
      "[Am11]Some [Cmaj7]lyrics"
    ].join("\n")
    const map = parseDefinedChords(lyrics)
    expect(map.size).toBe(2)
    expect(map.has("Am11")).toBe(true)
    expect(map.has("Cmaj7")).toBe(true)
  })

  it("later definitions override earlier ones for the same chord name", () => {
    const lyrics = [
      "{define: Am base-fret 1 frets x 0 2 2 1 0}",
      "{define: Am base-fret 5 frets x 0 2 0 1 0}"
    ].join("\n")
    const map = parseDefinedChords(lyrics)
    expect(map.size).toBe(1)
    expect(map.get("Am")?.baseFret).toBe(5)
  })

  it("skips malformed directives that have no frets keyword", () => {
    const lyrics = "{define: Weird base-fret 1}"
    const map = parseDefinedChords(lyrics)
    expect(map.size).toBe(0)
  })

  it("pads fingers array to match frets length when fingers are omitted", () => {
    const lyrics = "{define: G base-fret 1 frets 3 2 0 0 0 3}"
    const map = parseDefinedChords(lyrics)
    const pos = map.get("G")
    expect(pos?.fingers).toHaveLength(pos?.frets.length ?? 0)
    expect(pos?.fingers.every((f) => f === 0)).toBe(true)
  })
})
