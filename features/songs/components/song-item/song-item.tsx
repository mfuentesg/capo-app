"use client"
import { memo } from "react"
import { Check, Music2, Turtle, Rabbit, Zap, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getKeyColorClasses, getBpmColorClasses } from "@/lib/badge-colors"
import type { Song } from "@/features/songs/types"

interface SongItemProps {
  song: Song
  isSelected: boolean
  isInCart: boolean
  isDisabled?: boolean
  isPreview?: boolean
  bucketColor?: string
  onSelect: (song: Song) => void
  onToggleCart: (song: Song) => void
}

export const SongItem = memo(function SongItem({
  song,
  isSelected,
  isInCart,
  isDisabled = false,
  isPreview = false,
  bucketColor,
  onSelect,
  onToggleCart
}: SongItemProps) {
  const ownershipLabel =
    song.ownership?.type === "personal"
      ? "Me"
      : song.ownership?.type === "team"
        ? song.ownership.teamName.slice(0, 8)
        : null

  return (
    <div
      onClick={() => !isDisabled && onSelect(song)}
      style={
        bucketColor
          ? { borderLeftColor: bucketColor, borderLeftWidth: "3px", borderLeftStyle: "solid" }
          : undefined
      }
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-colors",
        isPreview
          ? "bg-muted"
          : isSelected && !isDisabled
            ? "bg-muted"
            : "bg-card",
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
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
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
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
              {ownershipLabel && bucketColor && (
                <span
                  className="shrink-0 inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium"
                  style={{
                    color: bucketColor,
                    background: `color-mix(in oklch, ${bucketColor} 12%, transparent)`
                  }}
                >
                  {ownershipLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn("gap-1.5 font-mono text-xs", getKeyColorClasses(song.key))}>
            <Music2 className="h-3 w-3" />
            {song.key}
          </Badge>
          <Badge variant="secondary" className={cn("gap-1.5 text-xs", getBpmColorClasses(song.bpm))}>
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
