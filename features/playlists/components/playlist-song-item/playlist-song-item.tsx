"use client"

import { Music2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SongWithPosition } from "@/types/extended"

interface PlaylistSongItemProps {
  song: SongWithPosition
  index: number
  className?: string
  showDragHandle?: boolean
}

export function PlaylistSongItem({ song, index, className }: PlaylistSongItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-sm",
        className
      )}
    >
      {/* Position Number */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {index + 1}
      </div>

      {/* Song Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-semibold leading-tight">{song.title}</h4>
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
