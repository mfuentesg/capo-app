"use client"

import { cn } from "@/lib/utils"
import { useLocale } from "@/features/settings"
import type { FretValue } from "../hooks/use-chord-analyzer"

/** Labels shown at the top of the fretboard for each string (low E → high E) */
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]

/** Number of fret columns shown on the input (not counting the open/muted column) */
const FRET_COUNT = 4

interface FretboardInputProps {
  frets: FretValue[]
  baseFret: number
  onStringFretChange: (stringIndex: number, value: FretValue) => void
  onIncrementBaseFret: () => void
  onDecrementBaseFret: () => void
  minBaseFret: number
  maxBaseFret: number
}

/**
 * Interactive fretboard grid.
 *
 * Each column (string) shows buttons for: X (muted) | 0 (open) | fret 1 … fret FRET_COUNT.
 * The base fret can be shifted up/down to access higher positions.
 */
export function FretboardInput({
  frets,
  baseFret,
  onStringFretChange,
  onIncrementBaseFret,
  onDecrementBaseFret,
  minBaseFret,
  maxBaseFret
}: FretboardInputProps) {
  const { t } = useLocale()

  return (
    <div className="space-y-3">
      {/* Fret position control */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">{t.chords.analyzer.fretPosition}</span>
        <button
          type="button"
          onClick={onDecrementBaseFret}
          disabled={baseFret <= minBaseFret}
          className="flex h-6 w-6 items-center justify-center rounded border text-sm disabled:opacity-30"
          aria-label={t.chords.analyzer.lowerFret}
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums">{baseFret}</span>
        <button
          type="button"
          onClick={onIncrementBaseFret}
          disabled={baseFret >= maxBaseFret}
          className="flex h-6 w-6 items-center justify-center rounded border text-sm disabled:opacity-30"
          aria-label={t.chords.analyzer.higherFret}
        >
          +
        </button>
      </div>

      {/* Fretboard grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(6, minmax(44px, 1fr))` }}>
          {/* String labels (header row) */}
          {STRING_LABELS.map((label, si) => (
            <div key={si} className="text-center text-xs font-semibold text-muted-foreground pb-1">
              {label}
            </div>
          ))}

          {/* Muted (X) row */}
          {frets.map((fret, si) => (
            <FretButton
              key={`mute-${si}`}
              active={fret === -1}
              label="✕"
              onClick={() => onStringFretChange(si, fret === -1 ? 0 : -1)}
              variant="mute"
            />
          ))}

          {/* Open string (0) row */}
          {frets.map((fret, si) => (
            <FretButton
              key={`open-${si}`}
              active={fret === 0}
              label="○"
              onClick={() => onStringFretChange(si, fret === 0 ? -1 : 0)}
              variant="open"
            />
          ))}

          {/* Fret 1 … FRET_COUNT rows */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => {
            const fretNum = fi + 1
            const label = baseFret === 1 && fretNum === 1 ? "1" : String(baseFret + fretNum - 1)
            return frets.map((fret, si) => (
              <FretButton
                key={`fret-${fretNum}-${si}`}
                active={fret === fretNum}
                label={label}
                onClick={() => onStringFretChange(si, fret === fretNum ? -1 : fretNum)}
                variant="fret"
              />
            ))
          })}
        </div>

        {/* Row labels on the left — shown as a legend below */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold">✕</span> {t.chords.analyzer.mutedLegend}
          </span>
          <span>
            <span className="font-semibold">○</span> {t.chords.analyzer.openLegend}
          </span>
          <span>{t.chords.analyzer.fretLegend}</span>
        </div>
      </div>
    </div>
  )
}

interface FretButtonProps {
  active: boolean
  label: string
  onClick: () => void
  variant: "mute" | "open" | "fret"
}

function FretButton({ active, label, onClick, variant }: FretButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 w-full rounded-md border text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? variant === "mute"
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
