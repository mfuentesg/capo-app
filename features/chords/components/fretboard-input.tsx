"use client"

import { FINGER_COLORS } from "@/components/chord-position-diagram"
import { useLocale } from "@/features/settings"
import type { FretValue } from "../hooks/use-chord-analyzer"

const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]
const FRET_COUNT = 7

// ── SVG layout ────────────────────────────────────────────────────────────────
const PAD_L = 52
const PAD_R = 12
const PAD_T = 20
const PAD_B = 18
const S_GAP = 22
const F_GAP = 42

const SVG_W = PAD_L + FRET_COUNT * F_GAP + PAD_R  // ≈ 358
const SVG_H = PAD_T + 5 * S_GAP + PAD_B           // ≈ 148

const sY = (si: number) => PAD_T + si * S_GAP
const fMidX = (fi: number) => PAD_L + (fi - 0.5) * F_GAP
const fDivX = (fi: number) => PAD_L + fi * F_GAP

const FRET_MARKERS = [3, 5, 7, 9, 12]

// ── Auto-assign fingers based on absolute fret order ─────────────────────────
// Finger 1 = lowest absolute fret, 2 = next unique, etc. (up to 4)
function assignFingers(frets: FretValue[], baseFret: number): number[] {
  const pressed = frets
    .map((f, si) => (f > 0 ? { si, absF: baseFret + f - 1 } : null))
    .filter((x): x is { si: number; absF: number } => x !== null)

  const uniqueFrets = [...new Set(pressed.map((p) => p.absF))].sort((a, b) => a - b)
  const map = new Map<number, number>()
  uniqueFrets.slice(0, 4).forEach((absF, idx) => map.set(absF, idx + 1))

  return frets.map((f) => {
    if (f <= 0) return 0
    return map.get(baseFret + f - 1) ?? 0
  })
}

// Span of pressed absolute frets (>3 means a stretch that may be hard to play)
function fretSpan(frets: FretValue[], baseFret: number): number {
  const absFrets = frets.filter((f) => f > 0).map((f) => baseFret + f - 1)
  if (absFrets.length < 2) return 0
  return Math.max(...absFrets) - Math.min(...absFrets)
}

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
  const fingers = assignFingers(frets, baseFret)
  const span = fretSpan(frets, baseFret)
  const isStretch = span > 3

  function handleFretCell(si: number, fi: number) {
    onStringFretChange(si, frets[si] === fi ? 0 : fi)
  }

  function handleXO(si: number) {
    onStringFretChange(si, frets[si] === -1 ? 0 : -1)
  }

  return (
    <div className="space-y-3">
      <div className="w-full max-w-lg mx-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          aria-label={t.chords.analyzer.fretboardLabel}
        >
          {/* Fret numbers (top) */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => (
            <text
              key={fi}
              x={fMidX(fi + 1)} y={PAD_T - 5}
              textAnchor="middle" fontSize="9"
              fill="currentColor" opacity="0.4"
            >
              {baseFret + fi}
            </text>
          ))}

          {/* Nut */}
          <rect
            x={PAD_L - (isNut ? 4 : 1.5)} y={PAD_T}
            width={isNut ? 5 : 2} height={5 * S_GAP}
            rx="1" fill="currentColor" opacity={isNut ? 0.7 : 0.2}
          />

          {/* Fret dividers */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => (
            <line
              key={fi}
              x1={fDivX(fi + 1)} y1={PAD_T}
              x2={fDivX(fi + 1)} y2={PAD_T + 5 * S_GAP}
              stroke="currentColor" strokeWidth="0.75" opacity="0.15"
            />
          ))}

          {/* String lines (heavier for wound strings) */}
          {STRING_LABELS.map((_, si) => (
            <line
              key={si}
              x1={PAD_L} y1={sY(si)} x2={SVG_W - PAD_R} y2={sY(si)}
              stroke="currentColor" strokeWidth={1.8 - si * 0.2} opacity="0.3"
            />
          ))}

          {/* Fret-position markers */}
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

          {/* String labels */}
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

          {/* X / O indicators */}
          {STRING_LABELS.map((_, si) => {
            const isMuted = frets[si] === -1
            const isOpen = frets[si] === 0
            const cx = PAD_L - 18
            const cy = sY(si)
            return (
              <g key={si} onClick={() => handleXO(si)} style={{ cursor: "pointer" }}>
                <rect x={cx - 10} y={cy - 10} width={20} height={20} fill="transparent" />
                {isMuted ? (
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
                  <circle cx={cx} cy={cy} r={7} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                ) : (
                  <>
                    <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4}
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
                    <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4}
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
                  </>
                )}
              </g>
            )
          })}

          {/* Fret cells + colored numbered dots ON string lines */}
          {Array.from({ length: FRET_COUNT }, (_, fi) => {
            const fi1 = fi + 1
            const cellX = PAD_L + fi * F_GAP
            return STRING_LABELS.map((_, si) => {
              const isActive = frets[si] === fi1
              const cy = sY(si)
              const cx = fMidX(fi1)
              const fingerNum = fingers[si]
              const color = fingerNum > 0 ? FINGER_COLORS[fingerNum] : "currentColor"

              return (
                <g key={`${fi}-${si}`} onClick={() => handleFretCell(si, fi1)} style={{ cursor: "pointer" }}>
                  <rect
                    x={cellX} y={cy - S_GAP / 2}
                    width={F_GAP} height={S_GAP}
                    fill="transparent"
                  />
                  {isActive && (
                    <>
                      <circle cx={cx} cy={cy} r={9} fill={color} />
                      {fingerNum > 0 && (
                        <text
                          x={cx} y={cy + 3.5}
                          textAnchor="middle" fontSize="9" fontWeight="bold"
                          style={{ fill: "white" }}
                        >
                          {fingerNum}
                        </text>
                      )}
                    </>
                  )}
                </g>
              )
            })
          })}
        </svg>
      </div>

      {/* Stretch warning */}
      {isStretch && (
        <p className="text-center text-[11px] text-amber-500 dark:text-amber-400">
          {t.chords.analyzer.stretchWarning}
        </p>
      )}

      {/* Fret position control */}
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
