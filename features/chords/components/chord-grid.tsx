"use client"

import * as React from "react"
import { ChordCard } from "./chord-card"
import { ChordDiagram } from "@/features/lyrics-editor"
import { keyLabel, type ChordEntry } from "../utils/chord-db-helpers"
import { useLocale } from "@/features/settings"

interface ChordGridProps {
  chords: ChordEntry[]
}

export function ChordGrid({ chords }: ChordGridProps) {
  const [selected, setSelected] = React.useState<ChordEntry | null>(null)
  const selectedName = selected
    ? selected.suffix === "major"
      ? keyLabel(selected.key)
      : `${keyLabel(selected.key)}${selected.suffix}`
    : null
  const { t } = useLocale()

  if (chords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="text-sm font-medium text-foreground">{t.chords.glossary.noResults}</p>
        <p className="text-xs text-muted-foreground">{t.common.tryDifferentSearch}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {chords.map((chord) => (
          <ChordCard key={`${chord.key}-${chord.suffix}`} chord={chord} onClick={() => setSelected(chord)} />
        ))}
      </div>

      <ChordDiagram chordName={selectedName} onClose={() => setSelected(null)} />
    </>
  )
}
