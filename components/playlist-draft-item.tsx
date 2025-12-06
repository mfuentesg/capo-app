import { X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Song } from "@/types"

interface PlaylistDraftItemProps {
  song: Song
  index: number
  onRemove: (songId: string) => void
}

export function PlaylistDraftItem({ song, index, onRemove }: PlaylistDraftItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      <span className="text-sm text-muted-foreground w-5">{index + 1}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-semibold">
        {song.key}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onRemove(song.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
