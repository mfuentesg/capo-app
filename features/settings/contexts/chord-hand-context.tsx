"use client"

import { createContext, useContext, useState, useTransition, useCallback, useMemo, type ReactNode } from "react"
import { setChordHandAction, type ChordHand } from "@/lib/actions/chord-hand"

const DEFAULT_CHORD_HAND: ChordHand = "left"

interface ChordHandContextType {
  chordHand: ChordHand
  isPending: boolean
  setChordHand: (hand: ChordHand) => void
}

const ChordHandContext = createContext<ChordHandContextType | undefined>(undefined)

export function ChordHandProvider({
  children,
  initialChordHand = DEFAULT_CHORD_HAND
}: {
  children: ReactNode
  initialChordHand?: ChordHand
}) {
  const [chordHand, setChordHandState] = useState<ChordHand>(initialChordHand)
  const [isPending, startTransition] = useTransition()

  const setChordHand = useCallback(
    (hand: ChordHand) => {
      setChordHandState(hand)
      startTransition(async () => {
        await setChordHandAction(hand)
      })
    },
    [startTransition]
  )

  const value = useMemo(() => ({ chordHand, isPending, setChordHand }), [chordHand, isPending, setChordHand])

  return <ChordHandContext.Provider value={value}>{children}</ChordHandContext.Provider>
}

export function useChordHand() {
  const context = useContext(ChordHandContext)
  if (context === undefined) {
    throw new Error("useChordHand must be used within a ChordHandProvider")
  }
  return context
}
