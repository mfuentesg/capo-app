import { X, GripVertical, Music2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Song } from "@/types"

interface PlaylistDraftItemProps {
  song: Song
  index: number
  onRemove: (songId: string) => void
}

export function PlaylistDraftItem({ song, index, onRemove }: PlaylistDraftItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <GripVertical className="h-4 w-4 mt-1 text-muted-foreground cursor-grab shrink-0" />
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {index + 1}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold leading-tight">{song.title}</h4>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{song.artist}</p>
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
