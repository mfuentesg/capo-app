import guitarDataRaw from "@tombatossals/chords-db/lib/guitar.json"

interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
  midi: number[]
}

interface ChordVariation {
  key: string
  suffix: string
  positions: ChordPosition[]
}

interface GuitarData {
  keys: string[]
  suffixes: string[]
  chords: Record<string, ChordVariation[]>
}

const guitarData = guitarDataRaw as unknown as GuitarData

function parseChord(chordName: string) {
  if (!chordName) return null

  // Split key and suffix
  const match = chordName.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return null

  const [, rawKey, rawSuffix] = match
  let key = rawKey
  let suffix = rawSuffix

  // Normalize key to database standard
  const keyMap: Record<string, string> = {
    "A#": "Bb",
    Db: "C#",
    "D#": "Eb",
    Gb: "F#",
    "G#": "Ab",
  }

  if (keyMap[key]) {
    key = keyMap[key]
  }

  // Handle the database weirdness where C# and F# are named Csharp and Fsharp in keys
  // Note: We need to see if we should map them here or let the component do it.
  // In the component, we access guitarData.chords[key].
  // If key is "C#", it should be "Csharp".
  const dbKeyMap: Record<string, string> = {
    "C#": "Csharp",
    "F#": "Fsharp",
  }
  
  const lookupKey = dbKeyMap[key] || key

  // Normalize suffix
  if (!suffix || suffix === "" || suffix.toLowerCase() === "maj") {
    suffix = "major"
  } else if (suffix.toLowerCase() === "m" || suffix.toLowerCase() === "min") {
    suffix = "minor"
  }

  // Handle common suffix aliases
  const suffixMap: Record<string, string> = {
    "maj7": "maj7",
    "min7": "m7",
    "m7": "m7",
    "dim7": "dim7",
    "sus2": "sus2",
    "sus4": "sus4",
  }

  if (suffixMap[suffix]) {
    suffix = suffixMap[suffix]
  }

  return { key: lookupKey, suffix }
}

describe("Chord Database Integration", () => {
  const dbChords = guitarData.chords

  const testCases = [
    { name: "C", expectedKey: "C", expectedSuffix: "major" },
    { name: "Cm", expectedKey: "C", expectedSuffix: "minor" },
    { name: "C#", expectedKey: "Csharp", expectedSuffix: "major" },
    { name: "C#m", expectedKey: "Csharp", expectedSuffix: "minor" },
    { name: "Db", expectedKey: "Csharp", expectedSuffix: "major" },
    { name: "Dbm", expectedKey: "Csharp", expectedSuffix: "minor" },
    { name: "D", expectedKey: "D", expectedSuffix: "major" },
    { name: "Eb", expectedKey: "Eb", expectedSuffix: "major" },
    { name: "F#", expectedKey: "Fsharp", expectedSuffix: "major" },
    { name: "Gb", expectedKey: "Fsharp", expectedSuffix: "major" },
    { name: "Ab", expectedKey: "Ab", expectedSuffix: "major" },
    { name: "G#", expectedKey: "Ab", expectedSuffix: "major" },
    { name: "A#", expectedKey: "Bb", expectedSuffix: "major" },
    { name: "Bb", expectedKey: "Bb", expectedSuffix: "major" },
    { name: "Cmaj7", expectedKey: "C", expectedSuffix: "maj7" },
    { name: "Cm7", expectedKey: "C", expectedSuffix: "m7" },
    { name: "Cmin7", expectedKey: "C", expectedSuffix: "m7" },
    { name: "Csus4", expectedKey: "C", expectedSuffix: "sus4" },
    { name: "C7", expectedKey: "C", expectedSuffix: "7" },
  ]

  testCases.forEach(({ name, expectedKey, expectedSuffix }) => {
    it(`should correctly resolve ${name} to ${expectedKey} ${expectedSuffix}`, () => {
      const parsed = parseChord(name)
      expect(parsed).not.toBeNull()
      if (parsed) {
        expect(parsed.key).toBe(expectedKey)
        expect(parsed.suffix).toBe(expectedSuffix)
        
        const variations = dbChords[parsed.key]
        expect(variations).toBeDefined()
        const hasSuffix = variations?.some(v => v.suffix === parsed.suffix)
        expect(hasSuffix).toBe(true)
      }
    })
  })

  it("should support all suffixes in the database for at least one key", () => {
    const allSuffixes = guitarData.suffixes
    const foundSuffixes = new Set<string>()

    Object.values(dbChords).forEach(variations => {
      variations.forEach(v => foundSuffixes.add(v.suffix))
    })

    allSuffixes.forEach(s => {
      expect(foundSuffixes.has(s)).toBe(true)
    })
  })
})
