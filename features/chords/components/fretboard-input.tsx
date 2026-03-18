"use client"

import type { FretValue } from "../hooks/use-chord-analyzer"
import { useLocale } from "@/features/settings"

const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]
const FRET_COUNT = 7

// ── SVG layout constants ──────────────────────────────────────────────────
const PAD_L = 52   // left: string labels + X/O area
const PAD_R = 12   // right padding
const PAD_T = 20   // top: fret-number labels
const PAD_B = 18   // bottom: fret-marker dots
const S_GAP = 22   // vertical gap between strings
const F_GAP = 42   // horizontal width of each fret cell

const SVG_W = PAD_L + FRET_COUNT * F_GAP + PAD_R  // ≈ 358
const SVG_H = PAD_T + 5 * S_GAP + PAD_B           // ≈ 148

/** y-coordinate of string si (0 = low E, 5 = high e) */
const sY = (si: number) => PAD_T + si * S_GAP
/** x-coordinate of the midpoint of relative fret fi (1-indexed) */
const fMidX = (fi: number) => PAD_L + (fi - 0.5) * F_GAP
/** x-coordinate of the divider line after fret fi */
const fDivX = (fi: number) => PAD_L + fi * F_GAP

/** One color per string — mirrors the login feature-dot palette */
const DOT_COLORS = [
  "#3b82f6", // blue-500   — E (low)
  "#8b5cf6", // violet-500 — A
  "#f59e0b", // amber-500  — D
  "#22c55e", // green-500  — G
  "#ec4899", // pink-500   — B
  "#f97316", // orange-500 — e (high)
]

/** Standard guitar fret-marker positions */
const FRET_MARKERS = [3, 5, 7, 9, 12]

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
  const isNut = baseFret === 1

  function handleFretCell(si: number, fi: number) {
    // Tapping the active fret releases the string to open; tapping empty presses it
    onStringFretChange(si, frets[si] === fi ? 0 : fi)
  }

  function handleXO(si: number) {
    // Toggle between muted (−1) and open (0)
    onStringFretChange(si, frets[si] === -1 ? 0 : -1)
  }

  return (
    <div className="space-y-3">
      <div className="w-full max-w-lg mx-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          aria-label="Guitar fretboard input"
        >
          {/* ── Fret number labels (top) ─────────────────────────── */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => (
            <text
              key={fi}
              x={fMidX(fi + 1)}
              y={PAD_T - 5}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity="0.4"
            >
              {baseFret + fi}
            </text>
          ))}

          {/* ── Nut ─────────────────────────────────────────────── */}
          <rect
            x={PAD_L - (isNut ? 4 : 1.5)}
            y={PAD_T}
            width={isNut ? 5 : 2}
            height={5 * S_GAP}
            rx="1"
            fill="currentColor"
            opacity={isNut ? 0.7 : 0.2}
          />

          {/* ── Fret divider lines ───────────────────────────────── */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => (
            <line
              key={fi}
              x1={fDivX(fi + 1)} y1={PAD_T}
              x2={fDivX(fi + 1)} y2={PAD_T + 5 * S_GAP}
              stroke="currentColor" strokeWidth="0.75" opacity="0.15"
            />
          ))}

          {/* ── String lines (thicker for wound strings) ─────────── */}
          {STRING_LABELS.map((_, si) => (
            <line
              key={si}
              x1={PAD_L} y1={sY(si)}
              x2={SVG_W - PAD_R} y2={sY(si)}
              stroke="currentColor"
              strokeWidth={1.8 - si * 0.2}
              opacity="0.3"
            />
          ))}

          {/* ── Fret-position markers (below bottom string) ──────── */}
          {FRET_MARKERS.map((absM) => {
            const relFi = absM - baseFret + 1
            if (relFi < 1 || relFi > FRET_COUNT) return null
            const x = fMidX(relFi)
            const y = PAD_T + 5 * S_GAP + PAD_B * 0.55
            return absM === 12 ? (
              <g key={absM}>
                <circle cx={x - 4} cy={y} r={2} fill="currentColor" opacity="0.2" />
                <circle cx={x + 4} cy={y} r={2} fill="currentColor" opacity="0.2" />
              </g>
            ) : (
              <circle key={absM} cx={x} cy={y} r={2.5} fill="currentColor" opacity="0.2" />
            )
          })}

          {/* ── String labels (left edge) ────────────────────────── */}
          {STRING_LABELS.map((label, si) => (
            <text
              key={si}
              x={8} y={sY(si) + 3.5}
              fontSize="11" fontWeight="600"
              fill="currentColor" opacity="0.45"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          {/* ── X / O indicators (between label and nut) ────────── */}
          {STRING_LABELS.map((_, si) => {
            const isMuted = frets[si] === -1
            const isOpen = frets[si] === 0
            const cx = PAD_L - 18
            const cy = sY(si)
            return (
              <g key={si} onClick={() => handleXO(si)} style={{ cursor: "pointer" }}>
                {/* Invisible hit area */}
                <rect x={cx - 10} y={cy - 10} width={20} height={20} fill="transparent" />

                {isMuted ? (
                  // Filled circle with ✕ cross
                  <>
                    <circle cx={cx} cy={cy} r={8} fill="currentColor" opacity="0.8" />
                    <line
                      x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4}
                      style={{ stroke: "hsl(var(--background))" }}
                      strokeWidth="1.8" strokeLinecap="round"
                    />
                    <line
                      x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4}
                      style={{ stroke: "hsl(var(--background))" }}
                      strokeWidth="1.8" strokeLinecap="round"
                    />
                  </>
                ) : isOpen ? (
                  // Open circle (○)
                  <circle cx={cx} cy={cy} r={7} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                ) : (
                  // String is pressed — faint ✕ hint so user can mute it
                  <>
                    <line
                      x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4}
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2"
                    />
                    <line
                      x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4}
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2"
                    />
                  </>
                )}
              </g>
            )
          })}

          {/* ── Fret cells: hit areas + colored dots on string ───── */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => {
            const fi1 = fi + 1
            const cellX = PAD_L + fi * F_GAP
            return STRING_LABELS.map((_, si) => {
              const isActive = frets[si] === fi1
              const cy = sY(si)
              const cx = fMidX(fi1)
              return (
                <g key={`${fi}-${si}`} onClick={() => handleFretCell(si, fi1)} style={{ cursor: "pointer" }}>
                  {/* Full-cell hit area */}
                  <rect
                    x={cellX} y={cy - S_GAP / 2}
                    width={F_GAP} height={S_GAP}
                    fill="transparent"
                  />
                  {/* Dot sitting on the string line */}
                  {isActive && (
                    <circle cx={cx} cy={cy} r={9} fill={DOT_COLORS[si]} />
                  )}
                </g>
              )
            })
          })}
        </svg>
      </div>

      {/* ── Fret position control ──────────────────────────────────── */}
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
        <span className="min-w-[90px] text-center text-xs text-muted-foreground tabular-nums">
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
