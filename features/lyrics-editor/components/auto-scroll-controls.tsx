"use client"

import { Minus, Pause, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

interface AutoScrollControlsProps {
  isScrolling: boolean
  onToggle: () => void
  speed: number
  onIncrease: () => void
  onDecrease: () => void
  isAtMin: boolean
  isAtMax: boolean
}

export function AutoScrollControls({
  isScrolling,
  onToggle,
  speed,
  onIncrease,
  onDecrease,
  isAtMin,
  isAtMax
}: AutoScrollControlsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrease}
        disabled={isAtMin}
        aria-label={t.songs.lyrics.autoScroll.decreaseSpeed}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={isScrolling ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={onToggle}
        aria-label={isScrolling ? t.songs.lyrics.autoScroll.stop : t.songs.lyrics.autoScroll.start}
      >
        {isScrolling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrease}
        disabled={isAtMax}
        aria-label={t.songs.lyrics.autoScroll.increaseSpeed}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
        {speed}
      </span>
    </div>
  )
}
