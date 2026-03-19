"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "chord-diagram-orientation"

export interface ChordOrientation {
  flipVertical: boolean
  mirror: boolean
}

const DEFAULT: ChordOrientation = { flipVertical: false, mirror: false }

// Module-level state shared across all hook instances
let current: ChordOrientation = DEFAULT
const listeners = new Set<(o: ChordOrientation) => void>()

function readStorage(): ChordOrientation {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT, ...JSON.parse(stored) }
  } catch {
    // ignore
  }
  return DEFAULT
}

function persist(next: ChordOrientation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  current = next
  listeners.forEach((l) => l(next))
}

export function useChordOrientation() {
  // Initialize with DEFAULT so server and client render identically (no hydration mismatch).
  // After hydration, useEffect syncs to the stored localStorage value.
  const [orientation, setOrientation] = useState<ChordOrientation>(DEFAULT)

  useEffect(() => {
    // Sync to stored value after hydration
    const stored = readStorage()
    current = stored
    setOrientation(stored)

    const listener = (next: ChordOrientation) => setOrientation(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const toggleFlipVertical = useCallback(() => {
    persist({ ...current, flipVertical: !current.flipVertical })
  }, [])

  const toggleMirror = useCallback(() => {
    persist({ ...current, mirror: !current.mirror })
  }, [])

  return { ...orientation, toggleFlipVertical, toggleMirror }
}
