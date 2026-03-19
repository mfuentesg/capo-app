import guitarDataRaw from "@tombatossals/chords-db/lib/guitar.json"

interface ChordVariation {
  suffix: string
  positions: ChordPosition[]
}

interface GuitarData {
  main: {
    strings: number
    fretsOnChord: number
    name: string
    numberOfChords: number
  }
  tunings: {
    standard: string[]
  }
  keys: string[]
  suffixes: string[]
  chords: Record<string, ChordVariation[]>
}

export interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
  midi?: number[]
}

export interface ChordEntry {
  key: string
  suffix: string
  /** Display name, e.g. "Am", "Gmaj7" */
  name: string
  positions: ChordPosition[]
}

export const guitarDb = guitarDataRaw as unknown as GuitarData

/** Returns all chords in the DB as a flat list */
export function getAllChords(): ChordEntry[] {
  return Object.entries(guitarDb.chords).flatMap(([key, variations]) =>
    (variations as ChordVariation[]).map((v) => ({
      key,
      suffix: v.suffix,
      name: v.suffix === "major" ? keyLabel(key) : `${keyLabel(key)}${v.suffix}`,
      positions: v.positions
    }))
  )
}

/** Filter chords by search query (name / key / suffix match) */
export function searchChords(query: string): ChordEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllChords()
  // Normalize "#" → "sharp" so "C#" matches the DB key "Csharp"
  const qNorm = q.replace(/#/g, "sharp")
  return getAllChords().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.key.toLowerCase() === qNorm ||
      c.suffix.toLowerCase().includes(q)
  )
}

/** Get all chords for a given key (e.g. "A", "Csharp") */
export function getChordsByKey(key: string): ChordEntry[] {
  const variations = (guitarDb.chords[key] as ChordVariation[] | undefined) ?? []
  return variations.map((v) => ({
    key,
    suffix: v.suffix,
    name: v.suffix === "major" ? key : `${key}${v.suffix}`,
    positions: v.positions
  }))
}

/** All root keys available in the DB (e.g. "A", "Bb", "Csharp", …) */
export function getAvailableKeys(): string[] {
  return guitarDb.keys
}

/** Human-readable label for a DB key (e.g. "Csharp" → "C#", "Bb" → "Bb") */
export function keyLabel(key: string): string {
  return key.replace("sharp", "#")
}
