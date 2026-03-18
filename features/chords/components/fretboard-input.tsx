"use client"

import { cn } from "@/lib/utils"
import { useLocale } from "@/features/settings"
import type { FretValue } from "../hooks/use-chord-analyzer"

/** Labels shown for each string (low E → high E) */
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]

/** Number of fret rows shown (not counting open/muted row) */
const FRET_COUNT = 4

/** One color per string — mirrors the login-page feature-dots palette */
const STRING_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-primary",
  "bg-green-500",
  "bg-pink-500",
  "bg-amber-500",
]

interface FretboardInputProps {
  frets: FretValue[]
  baseFret: number
  onStringFretChange: (stringIndex: number, value: FretValue) => void
  onIncrementBaseFret: () => void
  onDecrementBaseFret: () => void
  minBaseFret: number
  maxBaseFret: number
}

export function FretboardInput({
  frets,
  baseFret,
  onStringFretChange,
  onIncrementBaseFret,
  onDecrementBaseFret,
  minBaseFret,
  maxBaseFret,
}: FretboardInputProps) {
  const { t } = useLocale()

  function handleFretCell(si: number, fretNum: number) {
    // Tap active cell → release to open; tap empty cell → press it
    onStringFretChange(si, frets[si] === fretNum ? 0 : fretNum)
  }

  function handleMute(si: number) {
    onStringFretChange(si, frets[si] === -1 ? 0 : -1)
  }

  return (
    <div className="space-y-3">
      {/* Diagram container — centred, max width keeps dots tappable */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm select-none">
          {/* ── X / O row ───────────────────────────────────────── */}
          <div className="grid grid-cols-6 mb-1">
            {STRING_LABELS.map((_, si) => {
              const isMuted = frets[si] === -1
              const isOpen = frets[si] === 0
              return (
                <div key={si} className="flex items-center justify-center gap-0.5">
                  {/* X — mute toggle */}
                  <button
                    type="button"
                    aria-label={isMuted ? `Unmute string ${si + 1}` : `Mute string ${si + 1}`}
                    onClick={() => handleMute(si)}
                    className={cn(
                      "h-6 w-6 rounded-full text-xs font-bold leading-none transition-colors",
                      isMuted
                        ? "bg-foreground text-background"
                        : "text-muted-foreground/50 hover:text-foreground"
                    )}
                  >
                    ✕
                  </button>
                  {/* O — open indicator (read-only; shown when open and not muted) */}
                  {isOpen && (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                        "border-muted-foreground/50 text-muted-foreground"
                      )}
                      aria-label={`String ${si + 1} open`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Nut ─────────────────────────────────────────────── */}
          <div
            className={cn(
              "rounded-sm",
              baseFret === 1
                ? "h-[6px] bg-foreground/80"
                : "h-[3px] bg-muted-foreground/30"
            )}
          />

          {/* ── Fretboard grid ──────────────────────────────────── */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(6, 1fr)` }}
          >
            {Array.from({ length: FRET_COUNT }, (_, fi) => {
              const fretNum = fi + 1
              const absoluteFret = baseFret + fretNum - 1
              const isLastFretRow = fi === FRET_COUNT - 1

              return STRING_LABELS.map((_, si) => {
                const isActive = frets[si] === fretNum
                const isFirstCol = si === 0
                const isLastCol = si === STRING_LABELS.length - 1
                const color = STRING_COLORS[si]

                return (
                  <div
                    key={`${fi}-${si}`}
                    className={cn(
                      "relative flex h-12 items-center justify-center",
                      // String line (right border except last column)
                      !isLastCol && "border-r border-muted-foreground/25",
                      // Fret line (bottom border except last row)
                      !isLastFretRow && "border-b border-muted-foreground/15",
                    )}
                  >
                    {/* Fret number label on the left edge of the first column */}
                    {isFirstCol && (
                      <span className="absolute -left-5 text-[10px] tabular-nums text-muted-foreground/50 leading-none">
                        {absoluteFret}
                      </span>
                    )}

                    {/* Tappable area covers the full cell */}
                    <button
                      type="button"
                      aria-label={
                        isActive
                          ? `Release fret ${absoluteFret} on string ${si + 1}`
                          : `Press fret ${absoluteFret} on string ${si + 1}`
                      }
                      aria-pressed={isActive}
                      onClick={() => handleFretCell(si, fretNum)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {isActive && (
                        <span
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shadow-sm",
                            color,
                          )}
                        />
                      )}
                    </button>
                  </div>
                )
              })
            })}
          </div>

          {/* ── String labels ────────────────────────────────────── */}
          <div className="grid grid-cols-6 mt-1.5">
            {STRING_LABELS.map((label, si) => (
              <div
                key={si}
                className="flex items-center justify-center text-[11px] font-semibold text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fret position control ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDecrementBaseFret}
          disabled={baseFret <= minBaseFret}
          className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold disabled:opacity-30 transition-colors hover:bg-accent"
          aria-label={t.chords.analyzer.lowerFret}
        >
          −
        </button>
        <span className="min-w-[80px] text-center text-xs text-muted-foreground tabular-nums">
          {t.chords.analyzer.fretPosition} {baseFret}
        </span>
        <button
          type="button"
          onClick={onIncrementBaseFret}
          disabled={baseFret >= maxBaseFret}
          className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold disabled:opacity-30 transition-colors hover:bg-accent"
          aria-label={t.chords.analyzer.higherFret}
        >
          +
        </button>
      </div>
    </div>
  )
}
