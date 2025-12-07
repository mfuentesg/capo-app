import { Check, Music3, Music2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Song } from "@/types"

interface SongItemProps {
  song: Song
  isSelected: boolean
  isInCart: boolean
  onSelect: (song: Song) => void
  onToggleCart: (song: Song) => void
}

export function SongItem({ song, isSelected, isInCart, onSelect, onToggleCart }: SongItemProps) {
  return (
    <div
      onClick={() => onSelect(song)}
      className={cn(
        "group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-sm cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* Key Badge / Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleCart(song)
        }}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
          isInCart
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        {isInCart ? <Check className="h-4 w-4" /> : <Music3 className="h-4 w-4" />}
      </button>

      {/* Song Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-base font-semibold leading-tight">{song.title}</h4>
              {song.isDraft && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                  Draft
                </Badge>
              )}
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
}
