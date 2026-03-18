/**
 * Chord identifier — given fret positions on a guitar, identify what chord is being played.
 * This is the "reverse lookup" feature (issue #44): finger positions → chord name.
 *
 * Standard tuning: E2 A2 D3 G3 B3 E4  (string index 0 = low E)
 */

// Semitone values: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
const OPEN_STRING_NOTES = [4, 9, 2, 7, 11, 4] as const // E A D G B E

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

/**
 * Common chord patterns: sorted from most to least restrictive so that a full
 * match (all chord tones present) beats a partial one.
 *
 * Intervals are expressed as semitones from the root, mod 12.
 */
const CHORD_PATTERNS: ReadonlyArray<{ suffix: string; intervals: ReadonlyArray<number> }> = [
  // Triads
  { suffix: "major", intervals: [0, 4, 7] },
  { suffix: "minor", intervals: [0, 3, 7] },
  { suffix: "dim", intervals: [0, 3, 6] },
  { suffix: "aug", intervals: [0, 4, 8] },
  { suffix: "sus4", intervals: [0, 5, 7] },
  { suffix: "sus2", intervals: [0, 2, 7] },
  { suffix: "5", intervals: [0, 7] },
  // Seventh chords
  { suffix: "7", intervals: [0, 4, 7, 10] },
  { suffix: "maj7", intervals: [0, 4, 7, 11] },
  { suffix: "m7", intervals: [0, 3, 7, 10] },
  { suffix: "mmaj7", intervals: [0, 3, 7, 11] },
  { suffix: "dim7", intervals: [0, 3, 6, 9] },
  { suffix: "m7b5", intervals: [0, 3, 6, 10] },
  { suffix: "7sus4", intervals: [0, 5, 7, 10] },
  // Sixth chords
  { suffix: "6", intervals: [0, 4, 7, 9] },
  { suffix: "m6", intervals: [0, 3, 7, 9] },
  // Extended chords
  { suffix: "add9", intervals: [0, 4, 7, 2] },
  { suffix: "9", intervals: [0, 4, 7, 10, 2] },
  { suffix: "maj9", intervals: [0, 4, 7, 11, 2] },
  { suffix: "m9", intervals: [0, 3, 7, 10, 2] },
  { suffix: "69", intervals: [0, 4, 7, 9, 2] },
  // Altered dominants
  { suffix: "7b9", intervals: [0, 4, 7, 10, 1] },
  { suffix: "7#9", intervals: [0, 4, 7, 10, 3] },
]

export interface IdentifiedChord {
  root: string
  suffix: string
  /** Display name — "C" for major, "Am" for minor, "Gmaj7" for maj7, etc. */
  name: string
  confidence: "exact" | "partial"
  /** Number of chord tones not present in the played notes */
  missingNotes: number
}

/**
 * Identify what chord is being played from 6 fret positions.
 *
 * @param frets - Array of 6 values: -1 = muted, 0 = open string, 1+ = fret number
 * @param baseFret - The lowest fret position shown (default 1); fret values are
 *                   relative to this — so fret=1, baseFret=5 → absolute fret 5.
 */
export function identifyChord(frets: number[], baseFret: number = 1): IdentifiedChord[] {
  const playedNotes = new Set<number>()

  for (let i = 0; i < 6; i++) {
    const fret = frets[i]
    if (fret < 0) continue // muted
    const absoluteFret = fret === 0 ? 0 : fret + baseFret - 1
    const note = (OPEN_STRING_NOTES[i] + absoluteFret) % 12
    playedNotes.add(note)
  }

  if (playedNotes.size < 2) return []

  const results: IdentifiedChord[] = []

  for (let root = 0; root < 12; root++) {
    if (!playedNotes.has(root)) continue // root must be in played notes

    for (const { suffix, intervals } of CHORD_PATTERNS) {
      const chordNotes = new Set(intervals.map((i) => (root + i) % 12))

      // All played notes must be valid chord tones
      let alien = false
      for (const note of playedNotes) {
        if (!chordNotes.has(note)) {
          alien = true
          break
        }
      }
      if (alien) continue

      const missingNotes = [...chordNotes].filter((n) => !playedNotes.has(n)).length

      const rootName = NOTE_NAMES[root]
      const name = suffix === "major" ? rootName : `${rootName}${suffix}`
      results.push({
        root: rootName,
        suffix,
        name,
        confidence: missingNotes === 0 ? "exact" : "partial",
        missingNotes
      })
    }
  }

  // Prefer exact matches, then fewer missing notes, then simpler chords (fewer intervals)
  results.sort((a, b) => {
    if (a.confidence !== b.confidence) return a.confidence === "exact" ? -1 : 1
    if (a.missingNotes !== b.missingNotes) return a.missingNotes - b.missingNotes
    return 0
  })

  // Deduplicate by name
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.name)) return false
    seen.add(r.name)
    return true
  })
}

/**
 * Returns the unique note names (pitch classes) produced by the given fret
 * positions, in order of string (low E to high E), muted strings omitted.
 */
export function getNotesFromFrets(frets: number[], baseFret: number = 1): string[] {
  const notes: string[] = []
  const seen = new Set<number>()

  for (let i = 0; i < 6; i++) {
    const fret = frets[i]
    if (fret < 0) continue
    const absoluteFret = fret === 0 ? 0 : fret + baseFret - 1
    const noteIndex = (OPEN_STRING_NOTES[i] + absoluteFret) % 12
    if (!seen.has(noteIndex)) {
      seen.add(noteIndex)
      notes.push(NOTE_NAMES[noteIndex])
    }
  }

  return notes
}
