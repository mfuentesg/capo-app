"use client"

import * as React from "react"
// @ts-expect-error - no types for this library
import Chord from "@tombatossals/react-chords/lib/Chord"
import { guitarDb, keyLabel, type ChordEntry } from "../utils/chord-db-helpers"
import { cn } from "@/lib/utils"

interface ChordCardProps {
  chord: ChordEntry
  onClick?: () => void
}

export function ChordCard({ chord, onClick }: ChordCardProps) {
  const position = chord.positions[0]
  if (!position) return null

  const displayName = chord.suffix === "major" ? keyLabel(chord.key) : chord.name

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3",
        "transition-colors hover:border-border hover:bg-accent/30 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <div className="w-full overflow-hidden rounded-lg bg-white dark:bg-zinc-950 p-2">
        <div className="scale-[0.9] origin-top">
          <Chord
            chord={position}
            instrument={{
              ...guitarDb.main,
              tunings: guitarDb.tunings
            }}
            lite
          />
        </div>
      </div>
      <span className="text-sm font-semibold leading-none text-foreground">{displayName}</span>
    </button>
  )
}
