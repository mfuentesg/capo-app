import {
  detectFormat,
  convertChordAboveLyrics,
  convertToChordPro
} from "../../utils/chordpro-converter"

describe("detectFormat", () => {
  it("detects chordpro bracket notation", () => {
    expect(detectFormat("[G]Amazing [C]grace how sweet the sound")).toBe("chordpro")
  })

  it("detects chord-above-lyrics format", () => {
    const text = "G      C\nAmazing grace how sweet the sound"
    expect(detectFormat(text)).toBe("chord-above-lyrics")
  })

  it("falls back to plain-text for regular prose", () => {
    expect(detectFormat("Amazing grace how sweet the sound\nThat saved a wretch like me")).toBe(
      "plain-text"
    )
  })

  it("detects chord-above-lyrics with multiple chord lines", () => {
    const text = [
      "G      C      G",
      "Amazing grace how sweet the sound",
      "G      C      D",
      "That saved a wretch like me"
    ].join("\n")
    expect(detectFormat(text)).toBe("chord-above-lyrics")
  })

  it("detects chordpro even if chord-above pattern is also present", () => {
    // If any bracket chords exist, it's chordpro
    const text = "G      C\n[G]Amazing [C]grace"
    expect(detectFormat(text)).toBe("chordpro")
  })

  it("recognizes common chord variations", () => {
    const text = "Am     F      C      G\nSome lyrics here"
    expect(detectFormat(text)).toBe("chord-above-lyrics")
  })

  it("returns plain-text for empty string", () => {
    expect(detectFormat("")).toBe("plain-text")
  })
})

describe("convertChordAboveLyrics", () => {
  it("merges chord line into lyric line at correct positions", () => {
    const input = "G      C\nAmazing grace"
    const result = convertChordAboveLyrics(input)
    expect(result).toBe("[G]Amazing [C]grace")
  })

  it("handles chord beyond the end of lyrics line", () => {
    const input = "G      C      D\nAmazing grace"
    const result = convertChordAboveLyrics(input)
    // D at position 15, lyric line is shorter — D inserted at end
    expect(result).toContain("[G]")
    expect(result).toContain("[C]")
    expect(result).toContain("[D]")
  })

  it("passes through non-chord lines unchanged", () => {
    const input = "Just some plain text\nwith no chords"
    expect(convertChordAboveLyrics(input)).toBe(input)
  })

  it("converts multi-verse song correctly", () => {
    const input = [
      "G      C",
      "Amazing grace",
      "G      D",
      "How sweet the sound"
    ].join("\n")
    const result = convertChordAboveLyrics(input)
    const lines = result.split("\n")
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain("[G]")
    expect(lines[0]).toContain("[C]")
    expect(lines[1]).toContain("[G]")
    expect(lines[1]).toContain("[D]")
  })

  it("preserves empty lines between verses", () => {
    const input = ["G  C", "First line", "", "Am F", "Second line"].join("\n")
    const result = convertChordAboveLyrics(input)
    expect(result).toContain("\n\n")
  })

  it("leaves trailing chord-only line if no following lyric", () => {
    const input = "Some lyrics\nG  C"
    const result = convertChordAboveLyrics(input)
    // chord line at end with no following lyric — kept as-is
    expect(result).toContain("G  C")
  })
})

describe("convertToChordPro", () => {
  it("returns chordpro input unchanged with format=chordpro", () => {
    const input = "[G]Amazing [C]grace"
    const { format, output } = convertToChordPro(input)
    expect(format).toBe("chordpro")
    expect(output).toBe(input)
  })

  it("converts chord-above-lyrics and reports format", () => {
    const input = "G      C\nAmazing grace"
    const { format, output } = convertToChordPro(input)
    expect(format).toBe("chord-above-lyrics")
    expect(output).toContain("[G]")
    expect(output).toContain("[C]")
  })

  it("returns plain-text unchanged with format=plain-text", () => {
    const input = "Amazing grace how sweet the sound"
    const { format, output } = convertToChordPro(input)
    expect(format).toBe("plain-text")
    expect(output).toBe(input)
  })
})
