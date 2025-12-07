"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Song } from "@/types"

interface SongProps {
  song: Song
  className?: string
  editable?: boolean
  onClick?: () => void
}

export function Song({ song, className, editable = true, onClick }: SongProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background p-3",
        editable && "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs font-semibold shrink-0">
        {song.key}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      <Badge variant="secondary" className="text-xs shrink-0">
        {song.bpm} BPM
      </Badge>
    </div>
  )
}
