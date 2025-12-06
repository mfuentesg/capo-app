/**
 * Music theory utilities for key transposition
 */

// Musical notes in chromatic scale (semitone intervals)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CHROMATIC_SCALE = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B"
] as const

/**
 * Transpose a musical key by a number of semitones
 * @param key - The original key (e.g., "G", "Gm", "C#")
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns The transposed key
 */
export function transposeKey(key: string, semitones: number): string {
  if (!key || semitones === 0) return key

  // Extract the root note and modifiers (m, maj, min, etc.)
  const match = key.match(/^([A-G][#b]?)(.*)?$/)
  if (!match) return key

  const [, rootNote, modifier = ""] = match

  // Normalize the root note
  let normalizedRoot = rootNote
  if (rootNote === "Db") normalizedRoot = "C#"
  if (rootNote === "Eb") normalizedRoot = "D#"
  if (rootNote === "Gb") normalizedRoot = "F#"
  if (rootNote === "Ab") normalizedRoot = "G#"
  if (rootNote === "Bb") normalizedRoot = "A#"

  // Find the index in chromatic scale
  const noteMap: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11
  }

  const currentIndex = noteMap[normalizedRoot]
  if (currentIndex === undefined) return key

  // Calculate new index (modulo 12 to wrap around)
  let newIndex = (currentIndex + semitones) % 12
  if (newIndex < 0) newIndex += 12

  // Map back to note names (prefer sharps for positive transpose, flats for negative)
  const sharpNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const flatNotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

  const preferSharps = semitones >= 0 || rootNote.includes("#")
  const notes = preferSharps ? sharpNotes : flatNotes
  const newRoot = notes[newIndex]

  return newRoot + modifier
}

/**
 * Calculate the effective key when using a capo
 * @param originalKey - The original key without capo
 * @param capoFret - The fret number where capo is placed
 * @returns The key you're playing in (with capo, play lower chords)
 */
export function calculateCapoKey(originalKey: string, capoFret: number): string {
  if (capoFret === 0) return originalKey
  // Capo raises pitch, so you play lower chords
  return transposeKey(originalKey, -capoFret)
}

/**
 * Calculate the actual sounding key with both transpose and capo
 * @param originalKey - The original key of the song
 * @param transpose - Number of semitones transposed
 * @param capo - Capo fret position
 * @returns The actual sounding key
 */
export function calculateEffectiveKey(
  originalKey: string,
  transpose: number,
  capo: number
): string {
  // First apply transpose to original key
  let effectiveKey = transposeKey(originalKey, transpose)

  // Then apply capo effect (capo raises pitch by capoFret semitones)
  if (capo > 0) {
    effectiveKey = transposeKey(effectiveKey, capo)
  }

  return effectiveKey
}
