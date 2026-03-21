"use client"

import { useSyncExternalStore, useCallback } from "react"
import { useChordHand } from "@/features/settings"

// In-memory singleton for flipVertical — shared across all components on the
// client. Resets on hard refresh (intentional). Survives soft navigation.
let current = false
const listeners = new Set<() => void>()

function getSnapshot(): boolean {
  return current
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function update(next: boolean) {
  current = next
  listeners.forEach((l) => l())
}

export function useChordOrientation() {
  const flipVertical = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const { chordHand } = useChordHand()
  const mirror = chordHand === "left"

  const toggleFlipVertical = useCallback(() => {
    update(!current)
  }, [])

  return { flipVertical, mirror, toggleFlipVertical }
}
