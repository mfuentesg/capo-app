"use client"

import * as React from "react"
import { ChordCard } from "./chord-card"
import { ChordDiagram } from "@/features/lyrics-editor"
import { keyLabel, type ChordEntry } from "../utils/chord-db-helpers"
import { useLocale } from "@/features/settings"
import { SearchX } from "lucide-react"

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
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="rounded-full bg-muted p-4">
          <SearchX className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{t.chords.glossary.noResults}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.common.tryDifferentSearch}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {chords.map((chord) => (
          <ChordCard key={`${chord.key}-${chord.suffix}`} chord={chord} onClick={() => setSelected(chord)} />
        ))}
      </div>

      <ChordDiagram chordName={selectedName} onClose={() => setSelected(null)} />
    </>
  )
}
