"use client"

import { FlipVertical2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChordOrientation } from "@/hooks/use-chord-orientation"
import { useLocale } from "@/features/settings"
import { cn } from "@/lib/utils"

interface ChordOrientationControlsProps {
  className?: string
}

export function ChordOrientationControls({ className }: ChordOrientationControlsProps) {
  const { flipVertical, toggleFlipVertical } = useChordOrientation()
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
    </div>
  )
}
