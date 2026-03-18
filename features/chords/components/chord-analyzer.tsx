"use client"

import * as React from "react"
// @ts-expect-error - no types for this library
import Chord from "@tombatossals/react-chords/lib/Chord"
import { Button } from "@/components/ui/button"
import { useChordAnalyzer } from "../hooks/use-chord-analyzer"
import { FretboardInput } from "./fretboard-input"
import { guitarDb, getAllChords } from "../utils/chord-db-helpers"
import { useLocale } from "@/features/settings"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

/** Attempt to find a DB position for the identified chord name (for diagram preview) */
function findDbPosition(chordName: string) {
  const all = getAllChords()
  const match = all.find((c) => c.name === chordName || (chordName === c.key && c.suffix === "major"))
  return match?.positions[0] ?? null
}

export function ChordAnalyzer() {
  const { t } = useLocale()
  const {
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
  } = useChordAnalyzer()

  const hasInput = frets.some((f) => f >= 0)

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t.chords.analyzer.instructions}</p>
        <Button variant="outline" size="sm" onClick={reset} className="gap-2 shrink-0">
          <RotateCcw className="h-3.5 w-3.5" />
          {t.chords.analyzer.reset}
        </Button>
      </div>

      {/* Interactive fretboard */}
      <FretboardInput
        frets={frets}
        baseFret={baseFret}
        onStringFretChange={setStringFret}
        onIncrementBaseFret={incrementBaseFret}
        onDecrementBaseFret={decrementBaseFret}
        minBaseFret={MIN_BASE_FRET}
        maxBaseFret={MAX_BASE_FRET}
      />

      {/* Notes being played */}
      {notes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t.chords.analyzer.notes}:
          </span>
          {notes.map((note) => (
            <span
              key={note}
              className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground"
            >
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {hasInput && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {results.length === 0 ? t.chords.analyzer.noMatch : t.chords.analyzer.matches}
          </h3>

          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {results.slice(0, 8).map((result) => {
                const dbPosition = findDbPosition(result.name)
                return (
                  <div
                    key={result.name}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-3",
                      result.confidence === "exact"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex w-full items-start justify-between">
                      <span className="text-base font-black tracking-tight leading-none">
                        {result.name}
                      </span>
                      {result.confidence === "exact" && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          {t.chords.analyzer.exact}
                        </span>
                      )}
                    </div>

                    {dbPosition && (
                      <div className="w-full overflow-hidden rounded-lg bg-white dark:bg-zinc-950 p-1">
                        <div className="scale-[0.85] origin-top">
                          <Chord
                            chord={dbPosition}
                            instrument={{ ...guitarDb.main, tunings: guitarDb.tunings }}
                            lite
                          />
                        </div>
                      </div>
                    )}

                    {result.missingNotes > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {t.chords.analyzer.missingNotes.replace("{count}", String(result.missingNotes))}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!hasInput && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <p className="text-sm">{t.chords.analyzer.emptyState}</p>
        </div>
      )}
    </div>
  )
}
