"use client"

import { useSyncExternalStore, useCallback } from "react"

const STORAGE_KEY = "chord-diagram-orientation"

export interface ChordOrientation {
  flipVertical: boolean
  mirror: boolean
}

const DEFAULT: ChordOrientation = { flipVertical: false, mirror: false }

const listeners = new Set<() => void>()

function getSnapshot(): ChordOrientation {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT, ...JSON.parse(stored) }
  } catch {
    // ignore
  }
  return DEFAULT
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

function persist(next: ChordOrientation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

export function useChordOrientation() {
  const orientation = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleFlipVertical = useCallback(() => {
    persist({ ...getSnapshot(), flipVertical: !getSnapshot().flipVertical })
  }, [])

  const toggleMirror = useCallback(() => {
    persist({ ...getSnapshot(), mirror: !getSnapshot().mirror })
  }, [])

  return { ...orientation, toggleFlipVertical, toggleMirror }
}
