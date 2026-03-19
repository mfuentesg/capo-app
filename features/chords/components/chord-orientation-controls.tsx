"use client"

import { FlipHorizontal2, FlipVertical2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChordOrientation } from "../hooks/use-chord-orientation"
import { useLocale } from "@/features/settings"
import { cn } from "@/lib/utils"

interface ChordOrientationControlsProps {
  className?: string
}

export function ChordOrientationControls({ className }: ChordOrientationControlsProps) {
  const { flipVertical, mirror, toggleFlipVertical, toggleMirror } = useChordOrientation()
  const { t } = useLocale()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant={flipVertical ? "default" : "outline"}
        size="sm"
        onClick={toggleFlipVertical}
        className="h-7 px-2 gap-1"
        title={t.chords.orientation.flipVertical}
      >
        <FlipVertical2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={mirror ? "default" : "outline"}
        size="sm"
        onClick={toggleMirror}
        className="h-7 px-2 gap-1 text-xs font-semibold"
        title={t.chords.orientation.mirror}
      >
        <FlipHorizontal2 className="h-3.5 w-3.5" />
        <span>{mirror ? t.chords.orientation.lh : t.chords.orientation.rh}</span>
      </Button>
    </div>
  )
}
