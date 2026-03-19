"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChordPositionDiagram, type ChordPosition } from "@/components/chord-position-diagram"
import { useChordAnalyzer } from "../hooks/use-chord-analyzer"
import { FretboardInput } from "./fretboard-input"
import { getAllChords } from "../utils/chord-db-helpers"
import { useLocale } from "@/features/settings"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChordOrientation } from "@/hooks/use-chord-orientation"

function findDbPosition(chordName: string): ChordPosition | null {
  const all = getAllChords()
  const match = all.find((c) => c.name === chordName || (chordName === c.key && c.suffix === "major"))
  return (match?.positions[0] as ChordPosition | undefined) ?? null
}

export function ChordAnalyzer() {
  const { t } = useLocale()
  const { flipVertical, mirror } = useChordOrientation()
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
    MAX_BASE_FRET,
  } = useChordAnalyzer()

  const hasInput = frets.some((f) => f >= 0)

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t.chords.analyzer.instructionsDiagram}</p>
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
                        <ChordPositionDiagram
                          position={dbPosition}
                          flipVertical={flipVertical}
                          mirror={mirror}
                        />
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
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-muted-foreground">
          <svg
            viewBox="0 0 100 200"
            className="w-20 h-40 opacity-35 text-muted-foreground"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="36" y="5" width="28" height="20" rx="5" strokeWidth="1.5" />
            <circle cx="32" cy="10" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="32" cy="17" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="32" cy="24" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="68" cy="10" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="68" cy="17" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="68" cy="24" r="2.5" fill="currentColor" stroke="none" />
            <rect x="37" y="25" width="26" height="2" rx="1" fill="currentColor" stroke="none" />
            <path d="M39,27 L41,88 L59,88 L61,27 Z" strokeWidth="1.5" />
            <line x1="39.4" y1="39" x2="60.6" y2="39" strokeWidth="1" opacity="0.6" />
            <line x1="39.7" y1="50" x2="60.3" y2="50" strokeWidth="1" opacity="0.6" />
            <line x1="40.0" y1="60" x2="60.0" y2="60" strokeWidth="1" opacity="0.6" />
            <line x1="40.3" y1="70" x2="59.7" y2="70" strokeWidth="1" opacity="0.6" />
            <line x1="40.6" y1="79" x2="59.4" y2="79" strokeWidth="1" opacity="0.6" />
            <path
              d="M41,88 C36,92 24,102 24,113 C24,124 33,129 33,136 C33,143 20,153 20,162 C20,178 34,192 50,192 C66,192 80,178 80,162 C80,153 67,143 67,136 C67,129 76,124 76,113 C76,102 64,92 59,88 Z"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="132" r="11" strokeWidth="1.5" />
            <rect x="39" y="162" width="22" height="4" rx="1.5" fill="currentColor" stroke="none" opacity="0.5" />
            <line x1="42.5" y1="27" x2="41.0" y2="164" strokeWidth="0.8" opacity="0.7" />
            <line x1="45.0" y1="27" x2="43.5" y2="164" strokeWidth="0.8" opacity="0.7" />
            <line x1="47.5" y1="27" x2="46.5" y2="164" strokeWidth="0.8" opacity="0.7" />
            <line x1="52.5" y1="27" x2="53.5" y2="164" strokeWidth="0.8" opacity="0.7" />
            <line x1="55.0" y1="27" x2="56.5" y2="164" strokeWidth="0.8" opacity="0.7" />
            <line x1="57.5" y1="27" x2="59.0" y2="164" strokeWidth="0.8" opacity="0.7" />
          </svg>
          <p className="text-sm">{t.chords.analyzer.emptyState}</p>
        </div>
      )}
    </div>
  )
}
