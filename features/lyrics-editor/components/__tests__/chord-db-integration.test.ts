import guitarDataRaw from "@tombatossals/chords-db/lib/guitar.json"
import { Chord as ChordJS } from "chordsheetjs"

interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
  midi?: number[]
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

function getStandardNote(rootName: string): string {
  const normalizedRoot = rootName.charAt(0).toUpperCase() + rootName.slice(1)
  const keyMap: Record<string, string> = {
    "A#": "Bb", "Db": "C#", "D#": "Eb", "Gb": "F#", "G#": "Ab",
  }
  const standardRoot = keyMap[normalizedRoot] || normalizedRoot
  const dbKeyMap: Record<string, string> = { "C#": "Csharp", "F#": "Fsharp" }
  return dbKeyMap[standardRoot] || standardRoot
}

function parseChord(
  chordName: string, 
  options: { allowBaseFallback?: boolean } = { allowBaseFallback: true }
): { key: string; suffix: string } | null {
  if (!chordName) return null

  const normalizedInput = chordName
    .replace(/ø/g, "m7b5").replace(/°/g, "dim").replace(/Δ/g, "maj7").replace(/6\/9/g, "69")

  let parsed: ChordJS | null = null
  try {
    parsed = ChordJS.parse(normalizedInput)
  } catch {
    const basicMatch = normalizedInput.match(/^([A-G][#b]?)(.*)$/i)
    if (basicMatch) return { key: getStandardNote(basicMatch[1]), suffix: basicMatch[2] || "major" }
    return null
  }

  if (!parsed || !parsed.root || parsed.root.type !== "symbol") {
    const basicMatch = normalizedInput.match(/^([A-G][#b]?)(.*)$/i)
    if (basicMatch) {
      const rootName = basicMatch[1]
      const suffix = basicMatch[2] || "major"
      return { key: getStandardNote(rootName), suffix }
    }
    return null
  }

  const normalizeSuffix = (rawSuffix: string | null, isMinor: boolean) => {
    const suffix = (rawSuffix || "").trim().replace(/[()]/g, "")
    const minorPrefixes = ["m", "min", "minor", "mi", "-"]
    const looksMinor = isMinor || minorPrefixes.includes(suffix.toLowerCase())
    if (suffix === "" || suffix === "major") return looksMinor ? "minor" : "major"
    if (minorPrefixes.includes(suffix.toLowerCase())) return "minor"
    if (suffix === "ø" || suffix === "ø7" || suffix === "m7b5" || suffix === "-7b5") return "m7b5"
    if (suffix === "o7" || suffix === "dim7" || suffix === "°7") return "dim7"
    if (suffix === "o" || suffix === "dim" || suffix === "°") return "dim"
    if (suffix === "+" || suffix === "aug" || suffix === "+5" || suffix === "#5") return "aug"
    if (suffix === "sus" || suffix === "sus4") return "sus4"
    if (suffix === "sus2") return "sus2"
    if (suffix === "7sus4" || suffix === "7sus") return "7sus4"
    if (suffix === "6/9" || suffix === "69") return "69"
    if (suffix === "7" || suffix === "dom7") return "7"
    if (suffix === "M7" || suffix === "maj7" || suffix === "ma7" || suffix === "Δ" || suffix === "Δ7") return "maj7"
    if (suffix === "m7" || suffix === "min7" || suffix === "mi7" || suffix === "-7") return "m7"
    if (suffix === "mM7" || suffix === "m(maj7)" || suffix === "mmaj7" || suffix === "-Δ7") return "mmaj7"
    if (suffix === "9") return "9"
    if (suffix === "M9" || suffix === "maj9") return "maj9"
    if (suffix === "m9" || suffix === "min9" || suffix === "-9") return "m9"
    if (suffix === "add9" || suffix === "add2" || suffix === "2") return "add9"
    if (suffix === "11") return "11"
    if (suffix === "13") return "13"
    const exactMap: Record<string, string> = {
      "7b9": "7b9", "7#9": "7#9", "7+9": "7#9", "m11": "m11", "maj13": "maj13", "6": "6", "m6": "m6", "-6": "m6",
    }
    return exactMap[suffix] || suffix
  }

  const rootName = (parsed.root.originalKeyString || "") + (parsed.root.modifier || "")
  const lookupKey = getStandardNote(rootName)

  if (parsed.bass && parsed.bass.type === "symbol") {
    const rawBassNote = parsed.bass.originalKeyString + (parsed.bass.modifier || "")
    const standardBass = getStandardNote(rawBassNote).replace("Csharp", "C#").replace("Fsharp", "F#")
    let baseSuffix = (parsed.suffix || "").trim()
    if (baseSuffix === "m" || baseSuffix === "min" || baseSuffix === "minor") baseSuffix = "m"
    else if (baseSuffix === "" || baseSuffix === "maj" || baseSuffix === "major") baseSuffix = ""
    const dbSlashSuffix = (baseSuffix + "/" + standardBass).trim()
    const exists = guitarData.chords[lookupKey]?.some((c) => c.suffix === dbSlashSuffix)
    if (exists) return { key: lookupKey, suffix: dbSlashSuffix }
    if (!options.allowBaseFallback) return null
  }

  return { key: lookupKey, suffix: normalizeSuffix(parsed.suffix, parsed.root.minor) }
}

describe("Chord Database Integration", () => {
  const dbChords = guitarData.chords

  const testCases = [
    { name: "C", expectedKey: "C", expectedSuffix: "major" },
    { name: "C#", expectedKey: "Csharp", expectedSuffix: "major" },
    { name: "D#", expectedKey: "Eb", expectedSuffix: "major" },
    { name: "Eb", expectedKey: "Eb", expectedSuffix: "major" },
    { name: "F#", expectedKey: "Fsharp", expectedSuffix: "major" },
    { name: "Gb", expectedKey: "Fsharp", expectedSuffix: "major" },
    { name: "Ab", expectedKey: "Ab", expectedSuffix: "major" },
    { name: "G#", expectedKey: "Ab", expectedSuffix: "major" },
    { name: "A#", expectedKey: "Bb", expectedSuffix: "major" },
    { name: "Bb", expectedKey: "Bb", expectedSuffix: "major" },
    { name: "Db", expectedKey: "Csharp", expectedSuffix: "major" },
    { name: "Cm", expectedKey: "C", expectedSuffix: "minor" },
    { name: "Gm", expectedKey: "G", expectedSuffix: "minor" },
    { name: "am", expectedKey: "A", expectedSuffix: "minor" },
    { name: "Cmaj7", expectedKey: "C", expectedSuffix: "maj7" },
    { name: "C/G", expectedKey: "C", expectedSuffix: "/G" },
    { name: "G/Gb", expectedKey: "G", expectedSuffix: "/F#" },
    { name: "G/F#", expectedKey: "G", expectedSuffix: "/F#" },
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
