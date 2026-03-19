"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  ChordPositionDiagram,
  type ChordPosition,
} from "@/components/chord-position-diagram"
import { keyLabel, type ChordEntry } from "../utils/chord-db-helpers"
import { cn } from "@/lib/utils"
import { useLocale } from "@/features/settings"

interface ChordDetailSheetProps {
  chord: ChordEntry | null
  onClose: () => void
}

export function ChordDetailSheet({ chord, onClose }: ChordDetailSheetProps) {
  const [positionIndex, setPositionIndex] = React.useState(0)
  const { t } = useLocale()
  const touchStartX = React.useRef(0)

  React.useEffect(() => {
    setPositionIndex(0)
  }, [chord])

  if (!chord) return null

  const displayName = chord.suffix === "major" ? keyLabel(chord.key) : chord.name
  const total = chord.positions.length
  const current = chord.positions[positionIndex] as ChordPosition

  const goPrev = () => setPositionIndex((i) => (i > 0 ? i - 1 : total - 1))
  const goNext = () => setPositionIndex((i) => (i < total - 1 ? i + 1 : 0))

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }

  return (
    <Sheet open={!!chord} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-auto max-h-[90dvh] rounded-t-2xl pb-safe">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-3xl font-black tracking-tight">{displayName}</SheetTitle>
          {total > 1 && (
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {t.chords.positionOf
                .replace("{current}", String(positionIndex + 1))
                .replace("{total}", String(total))}
            </p>
          )}
        </SheetHeader>

        <div
          className="flex flex-col items-center gap-4"
          onTouchStart={total > 1 ? handleTouchStart : undefined}
          onTouchEnd={total > 1 ? handleTouchEnd : undefined}
        >
          <div className="w-full rounded-2xl bg-white dark:bg-zinc-950 border border-border/50 px-4 py-5 shadow-md">
            {current && <ChordPositionDiagram position={current} />}
          </div>

          {total > 1 && (
            <div className="flex gap-2">
              {chord.positions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPositionIndex(i)}
                  aria-label={`Variation ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-[width,background-color] duration-200",
                    i === positionIndex
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
