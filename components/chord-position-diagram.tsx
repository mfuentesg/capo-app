"use client"

/**
 * Shared chord-diagram SVG renderer.
 * Used by the chords glossary, chord analyzer, and lyrics editor.
 */

// ── SVG layout ────────────────────────────────────────────────────────────────
const S  = 40   // string spacing
const F  = 36   // fret spacing
const PL = 26   // pad-left  (baseFret label)
const PT = 30   // pad-top   (X / O symbols)
const PR = 16   // pad-right (must be ≥ dot radius to avoid clipping)
const PB = 12   // pad-bottom
const NF = 4    // frets shown
const NS = 6    // strings
const DOT_R = 12 // dot radius

export const DIAGRAM_W = PL + (NS - 1) * S + PR  // 242
export const DIAGRAM_H = PT + NF * F + PB          // 186

/** x of string si (0 = low E, 5 = high e) */
const sx = (si: number) => PL + si * S
/** y of fret divider fi (0 = nut, 1..NF = fret lines) */
const fy = (fi: number) => PT + fi * F
/** y midpoint of relative fret fi (1-indexed) — where the dot sits */
const dotY = (fi: number) => PT + (fi - 0.5) * F

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ChordPosition {
  frets: number[]    // -1 muted, 0 open, 1..4 relative fret
  fingers: number[]  // 0 = none, 1..4 = finger
  baseFret: number
  barres: number[]   // relative fret numbers where a barre occurs
  capo?: boolean
  midi?: number[]
}

// ── Finger auto-assignment (used when fingers[] is all zeros) ─────────────────
export function autoAssignFingers(frets: number[], baseFret: number): number[] {
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

// ── Main diagram component ────────────────────────────────────────────────────
interface ChordPositionDiagramProps {
  position: ChordPosition
}

export function ChordPositionDiagram({ position }: ChordPositionDiagramProps) {
  const { frets, baseFret, barres } = position
  const isNut = baseFret === 1

  // Auto-assign fingers when the DB entry has none
  const fingers =
    position.fingers.every((f) => f === 0)
      ? autoAssignFingers(frets, baseFret)
      : position.fingers

  // Barre metadata: span + finger number for each barre fret
  const barreData = barres
    .map((barreFret) => {
      const barredSi = frets
        .map((f, si) => (f === barreFret ? si : -1))
        .filter((si) => si >= 0)
      if (barredSi.length < 2) return null
      const minSi = Math.min(...barredSi)
      const maxSi = Math.max(...barredSi)
      const fingerNum =
        Math.min(...barredSi.map((si) => fingers[si]).filter((f) => f > 0)) || 1
      return { barreFret, minSi, maxSi, fingerNum }
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)

  // Strings whose dot is already covered by a barre bar
  const barreCovered = new Set<string>()
  barreData.forEach((b) => {
    for (let si = b.minSi; si <= b.maxSi; si++) {
      barreCovered.add(`${si}-${b.barreFret}`)
    }
  })

  return (
    <svg viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`} className="w-full h-auto">
      {/* Nut / top line */}
      <rect
        x={PL} y={PT - (isNut ? 5 : 1.5)}
        width={(NS - 1) * S} height={isNut ? 5 : 2}
        rx="1" fill="currentColor" opacity={isNut ? 0.75 : 0.25}
      />

      {/* BaseFret label */}
      {!isNut && (
        <text
          x={PL - 10} y={dotY(1) + 4}
          textAnchor="middle" fontSize="11" fontWeight="600"
          fill="currentColor" opacity="0.7"
        >
          {baseFret}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: NF }, (_, fi) => (
        <line
          key={fi}
          x1={PL} y1={fy(fi + 1)} x2={PL + (NS - 1) * S} y2={fy(fi + 1)}
          stroke="currentColor" strokeWidth="0.75" opacity="0.15"
        />
      ))}

      {/* String lines */}
      {Array.from({ length: NS }, (_, si) => (
        <line
          key={si}
          x1={sx(si)} y1={PT} x2={sx(si)} y2={PT + NF * F}
          stroke="currentColor" strokeWidth="0.75" opacity="0.25"
        />
      ))}

      {/* Barre bars */}
      {barreData.map((b) => (
        <rect
          key={b.barreFret}
          x={sx(b.minSi) - 9} y={dotY(b.barreFret) - 10}
          width={sx(b.maxSi) - sx(b.minSi) + 18} height={20}
          rx={10}
          fill="currentColor" opacity="0.85"
        />
      ))}

      {/* Individual dots (skip barre-covered positions) */}
      {frets.map((fret, si) => {
        if (fret <= 0) return null
        if (barreCovered.has(`${si}-${fret}`)) return null
        const fingerNum = fingers[si]
        return (
          <g key={si}>
            <circle cx={sx(si)} cy={dotY(fret)} r={DOT_R} fill="currentColor" opacity="0.85" />
            {fingerNum > 0 && (
              <text
                x={sx(si)} y={dotY(fret) + 4}
                textAnchor="middle" fontSize="10" fontWeight="bold"
                style={{ fill: "hsl(var(--background))" }}
              >
                {fingerNum}
              </text>
            )}
          </g>
        )
      })}

      {/* X / O above the nut */}
      {frets.map((fret, si) => {
        const x = sx(si)
        const y = PT - 15
        if (fret === -1) {
          return (
            <g key={si}>
              <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6}
                stroke="currentColor" strokeWidth="1.5" opacity="0.65" strokeLinecap="round" />
              <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6}
                stroke="currentColor" strokeWidth="1.5" opacity="0.65" strokeLinecap="round" />
            </g>
          )
        }
        if (fret === 0) {
          return (
            <circle key={si} cx={x} cy={y} r={7}
              fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          )
        }
        return null
      })}
    </svg>
  )
}

// ── Finger legend ─────────────────────────────────────────────────────────────
export function FingerLegend() {
  return (
    <div className="flex items-center justify-center gap-4">
      {([1, 2, 3, 4] as const).map((f) => (
        <div key={f} className="flex flex-col items-center gap-1">
          <div
            className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold bg-foreground text-background shadow-sm"
          >
            {f}
          </div>
        </div>
      ))}
    </div>
  )
}
