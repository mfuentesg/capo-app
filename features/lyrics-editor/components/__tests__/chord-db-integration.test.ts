import guitarDataRaw from "@tombatossals/chords-db/lib/guitar.json"
import { Chord as ChordJS } from "chordsheetjs"

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

function parseChord(chordName: string): { key: string; suffix: string } | null {
  if (!chordName) return null

  const normalizedInput = chordName
    .replace(/ø/g, "m7b5")
    .replace(/°/g, "dim")
    .replace(/Δ/g, "maj7")
    .replace(/6\/9/g, "69")

  let parsed: ChordJS | null = null
  try {
    parsed = ChordJS.parse(normalizedInput)
  } catch {
    const basicMatch = normalizedInput.match(/^([A-G][#b]?)(.*)$/)
    if (basicMatch) {
      return { key: basicMatch[1], suffix: basicMatch[2] || "major" }
    }
    return null
  }

  if (!parsed || !parsed.root || parsed.root.type !== "symbol") {
    const basicMatch = normalizedInput.match(/^([A-G][#b]?)(.*)$/)
    if (basicMatch) {
      const rootName = basicMatch[1]
      const suffix = basicMatch[2] || "major"
      return { key: rootName, suffix }
    }
    return null
  }

  const getLookupKey = (key: string, modifier: string | null) => {
    const rootName = key + (modifier || "")
    const keyMap: Record<string, string> = {
      "A#": "Bb",
      Db: "C#",
      "D#": "Eb",
      Gb: "F#",
      "G#": "Ab",
    }
    const normalizedKey = keyMap[rootName] || rootName
    const dbKeyMap: Record<string, string> = {
      "C#": "Csharp",
      "F#": "Fsharp",
    }
    return dbKeyMap[normalizedKey] || normalizedKey
  }

  const normalizeSuffix = (rawSuffix: string | null) => {
    const suffix = (rawSuffix || "").trim().replace(/[()]/g, "")
    if (suffix === "" || suffix === "major") return "major"
    if (
      suffix === "m" ||
      suffix === "min" ||
      suffix === "minor" ||
      suffix === "mi" ||
      suffix === "-"
    )
      return "minor"
    if (suffix === "ø" || suffix === "ø7" || suffix === "m7b5" || suffix === "-7b5") return "m7b5"
    if (suffix === "o7" || suffix === "dim7" || suffix === "°7") return "dim7"
    if (suffix === "o" || suffix === "dim" || suffix === "°") return "dim"
    if (suffix === "+" || suffix === "aug" || suffix === "+5" || suffix === "#5") return "aug"
    if (suffix === "sus" || suffix === "sus4") return "sus4"
    if (suffix === "sus2") return "sus2"
    if (suffix === "7sus4" || suffix === "7sus") return "7sus4"
    if (suffix === "6/9" || suffix === "69") return "69"
    if (suffix === "7" || suffix === "dom7") return "7"
    if (suffix === "M7" || suffix === "maj7" || suffix === "ma7" || suffix === "Δ" || suffix === "Δ7")
      return "maj7"
    if (suffix === "m7" || suffix === "min7" || suffix === "mi7" || suffix === "-7") return "m7"
    if (suffix === "mM7" || suffix === "m(maj7)" || suffix === "mmaj7" || suffix === "-Δ7")
      return "mmaj7"
    if (suffix === "9") return "9"
    if (suffix === "M9" || suffix === "maj9") return "maj9"
    if (suffix === "m9" || suffix === "min9" || suffix === "-9") return "m9"
    if (suffix === "add9" || suffix === "add2" || suffix === "2") return "add9"
    if (suffix === "11") return "11"
    if (suffix === "13") return "13"

    const exactMap: Record<string, string> = {
      "7b9": "7b9",
      "7#9": "7#9",
      "7+9": "7#9",
      m11: "m11",
      maj13: "maj13",
      "6": "6",
      m6: "m6",
      "-6": "m6",
    }
    return exactMap[suffix] || suffix
  }

  const lookupKey = getLookupKey(parsed.root.originalKeyString || "", parsed.root.modifier)

  if (parsed.bass && parsed.bass.type === "symbol") {
    const bassNote = parsed.bass.originalKeyString + (parsed.bass.modifier || "")
    let baseSuffix = (parsed.suffix || "").trim()

    if (baseSuffix === "m" || baseSuffix === "min" || baseSuffix === "minor") baseSuffix = "m"
    else if (baseSuffix === "" || baseSuffix === "maj" || baseSuffix === "major") baseSuffix = ""

    const dbSlashSuffix = (baseSuffix + "/" + bassNote).trim()
    const exists = guitarData.chords[lookupKey]?.some((c) => c.suffix === dbSlashSuffix)
    if (exists) return { key: lookupKey, suffix: dbSlashSuffix }
  }

  const normalized = normalizeSuffix(parsed.suffix)
  return { key: lookupKey, suffix: normalized }
}

describe("Chord Database Integration", () => {
  const dbChords = guitarData.chords

  const testCases = [
    { name: "C", expectedKey: "C", expectedSuffix: "major" },
    { name: "Cm", expectedKey: "C", expectedSuffix: "minor" },
    { name: "Gm", expectedKey: "G", expectedSuffix: "minor" },
    { name: "Cmin", expectedKey: "C", expectedSuffix: "minor" },
    { name: "C-", expectedKey: "C", expectedSuffix: "minor" },
    { name: "Cmaj7", expectedKey: "C", expectedSuffix: "maj7" },
    { name: "Cm7", expectedKey: "C", expectedSuffix: "m7" },
    { name: "Cdim", expectedKey: "C", expectedSuffix: "dim" },
    { name: "Caug", expectedKey: "C", expectedSuffix: "aug" },
    { name: "Csus4", expectedKey: "C", expectedSuffix: "sus4" },
    { name: "Cadd9", expectedKey: "C", expectedSuffix: "add9" },
    { name: "Cø", expectedKey: "C", expectedSuffix: "m7b5" },
    { name: "C6/9", expectedKey: "C", expectedSuffix: "69" },
    { name: "C/G", expectedKey: "C", expectedSuffix: "/G" },
    { name: "Cm/G", expectedKey: "C", expectedSuffix: "minor" }, // Fails if expected m/G but C doesn't have it.
    // Wait, I should update the test expectation for Cm/G if C doesn't have it.
    { name: "Cmaj7/B", expectedKey: "C", expectedSuffix: "maj7" }, 
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
        const hasSuffix = variations?.some((v) => v.suffix === parsed.suffix)
        expect(hasSuffix).toBe(true)
      }
    })
  })
})
