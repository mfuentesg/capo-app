import { useMemo, useState } from "react"
import { identifyChord, getNotesFromFrets, type IdentifiedChord } from "../utils/chord-identifier"

/** -1 = muted, 0 = open, 1-N = fret relative to baseFret */
export type FretValue = number

const DEFAULT_FRETS: FretValue[] = [-1, -1, -1, -1, -1, -1]
const MIN_BASE_FRET = 1
const MAX_BASE_FRET = 12

export function useChordAnalyzer() {
  const [frets, setFrets] = useState<FretValue[]>([...DEFAULT_FRETS])
  const [baseFret, setBaseFret] = useState(1)

  const results = useMemo((): IdentifiedChord[] => {
    const hasAnyNote = frets.some((f) => f >= 0)
    if (!hasAnyNote) return []
    return identifyChord(frets, baseFret)
  }, [frets, baseFret])

  const notes = useMemo((): string[] => {
    const hasAnyNote = frets.some((f) => f >= 0)
    if (!hasAnyNote) return []
    return getNotesFromFrets(frets, baseFret)
  }, [frets, baseFret])

  function setStringFret(stringIndex: number, value: FretValue) {
    setFrets((prev) => {
      const next = [...prev]
      next[stringIndex] = value
      return next
    })
  }

  function reset() {
    setFrets([...DEFAULT_FRETS])
    setBaseFret(1)
  }

  function incrementBaseFret() {
    setBaseFret((prev) => Math.min(prev + 1, MAX_BASE_FRET))
  }

  function decrementBaseFret() {
    setBaseFret((prev) => Math.max(prev - 1, MIN_BASE_FRET))
  }

  return {
    frets,
    baseFret,
    results,
    notes,
    setStringFret,
    reset,
    incrementBaseFret,
    decrementBaseFret,
    MIN_BASE_FRET,
    MAX_BASE_FRET
  }
}
