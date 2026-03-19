"use client"

import { useSyncExternalStore, useCallback } from "react"

export interface ChordOrientation {
  flipVertical: boolean
  mirror: boolean
}

const DEFAULT: ChordOrientation = { flipVertical: false, mirror: false }

// In-memory singleton — shared across all components on the client.
// Resets on hard refresh (intentional: no localStorage complexity).
// Survives soft navigation because the client bundle stays loaded.
let current: ChordOrientation = DEFAULT
const listeners = new Set<() => void>()

function getSnapshot(): ChordOrientation {
  return current
}

function getServerSnapshot(): ChordOrientation {
  return DEFAULT
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function update(next: ChordOrientation) {
  current = next
  listeners.forEach((l) => l())
}

export function useChordOrientation() {
  const orientation = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleFlipVertical = useCallback(() => {
    update({ ...current, flipVertical: !current.flipVertical })
  }, [])

  const toggleMirror = useCallback(() => {
    update({ ...current, mirror: !current.mirror })
  }, [])

  return { ...orientation, toggleFlipVertical, toggleMirror }
}
