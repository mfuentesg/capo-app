import { Check, ChevronRight } from "lucide-react"
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
      className={cn(
        "group w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
      )}
    >
      <button
        onClick={() => onToggleCart(song)}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold transition-all",
          isInCart
            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
            : isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        {isInCart ? <Check className="h-5 w-5" /> : song.key}
      </button>

      <button onClick={() => onSelect(song)} className="flex flex-1 items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium truncate text-sm">{song.title}</p>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isSelected && "text-primary"
          )}
        />
      </button>
    </div>
  )
}
