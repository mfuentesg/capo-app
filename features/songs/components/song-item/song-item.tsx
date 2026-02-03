"use client"
import { memo } from "react"
import { Check, Music3, Music2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Song } from "@/features/songs/types"

interface SongItemProps {
  song: Song
  isSelected: boolean
  isInCart: boolean
  isDisabled?: boolean
  isPreview?: boolean
  onSelect: (song: Song) => void
  onToggleCart: (song: Song) => void
}

export const SongItem = memo(function SongItem({
  song,
  isSelected,
  isInCart,
  isDisabled = false,
  isPreview = false,
  onSelect,
  onToggleCart
}: SongItemProps) {
  return (
    <div
      onClick={() => !isDisabled && onSelect(song)}
      className={cn(
        "group flex items-start gap-4 rounded-lg border p-4 transition-all",
        isPreview ? "bg-orange-100/80 dark:bg-orange-900/30" : "bg-card",
        !isDisabled && "hover:shadow-sm cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed",
        isSelected && !isDisabled && "ring-2 ring-primary"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (!isDisabled) {
            onToggleCart(song)
          }
        }}
        disabled={isDisabled}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
          isInCart
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary hover:bg-primary/20",
          isDisabled && "cursor-not-allowed"
        )}
      >
        {isInCart ? <Check className="h-4 w-4" /> : <Music3 className="h-4 w-4" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-base font-semibold leading-tight">{song.title}</h4>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{song.artist}</p>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-mono text-xs">
            <Music2 className="h-3 w-3" />
            {song.key}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Clock className="h-3 w-3" />
            {song.bpm} BPM
          </Badge>
        </div>
      </div>
    </div>
  )
})
