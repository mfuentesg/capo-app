"use client"

import { Calendar, Music, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Playlist } from "@/types"

interface PlaylistItemProps {
  playlist: Playlist
  isSelected: boolean
  onSelect: (playlist: Playlist) => void
}

export function PlaylistItem({ playlist, isSelected, onSelect }: PlaylistItemProps) {
  return (
    <div
      onClick={() => onSelect(playlist)}
      className={`flex w-full items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
        isSelected
          ? "bg-primary/10 border-primary border"
          : "hover:bg-muted/50 border border-transparent"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <Music className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{playlist.name}</p>
        </div>
        {playlist.description && (
          <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {playlist.date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {new Date(playlist.date).toLocaleDateString()}
              </p>
            </div>
          )}
          {playlist.songs.length >= 0 && (
            <div className="flex items-center gap-1">
              <Music className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{playlist.songs.length}</p>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  )
}
