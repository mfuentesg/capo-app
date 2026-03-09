"use client"
import { memo } from "react"
import { Check, Music2, Turtle, Rabbit, Zap, Plus } from "lucide-react"
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
        "group flex items-center gap-3 rounded-lg border p-3 transition-all",
        isPreview
          ? "bg-orange-100/80 dark:bg-orange-900/30"
          : isSelected && !isDisabled
            ? "bg-primary/5"
            : "bg-gradient-to-br from-pink-500/5 via-violet-500/5 to-transparent",
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
        aria-label={isInCart ? "Remove from playlist" : "Add to playlist"}
        title={isInCart ? "Remove from playlist" : "Add to playlist"}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
          isInCart
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
          isDisabled && "cursor-not-allowed"
        )}
      >
        {isInCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold leading-tight">{song.title}</h4>
            <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-mono text-xs">
            <Music2 className="h-3 w-3" />
            {song.key}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            {song.bpm < 90 ? (
              <Turtle className="h-3 w-3" />
            ) : song.bpm <= 120 ? (
              <Rabbit className="h-3 w-3" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            {song.bpm} BPM
          </Badge>
        </div>
      </div>
    </div>
  )
})
