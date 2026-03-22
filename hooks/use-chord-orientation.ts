"use client"

import { useChordHand } from "@/features/settings"

export function useChordOrientation() {
  const { chordHand } = useChordHand()
  const mirror = chordHand === "left"

  return { mirror }
}
