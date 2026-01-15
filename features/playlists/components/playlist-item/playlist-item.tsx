"use client"

import { Calendar, Music3, Lock, Globe, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { Playlist } from "@/features/playlists/types"
import { useTranslation } from "@/hooks/use-translation"
import { formatDate } from "@/lib/utils"

interface PlaylistItemProps {
  playlist: Playlist
  isSelected: boolean
  onSelect: (playlist: Playlist) => void
}

export function PlaylistItem({ playlist, isSelected, onSelect }: PlaylistItemProps) {
  const { t } = useTranslation()
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
        <Music3 className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{playlist.name}</p>
          {playlist.isDraft && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
              {t.playlists.draft}
            </Badge>
          )}
          {playlist.visibility === "private" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t.playlistItem.privatePlaylist}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {playlist.visibility === "public" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  {playlist.allowGuestEditing && (
                    <Users className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {playlist.allowGuestEditing
                    ? t.playlistItem.publicGuestEditing
                    : t.playlistItem.publicViewOnly}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {playlist.date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {formatDate(playlist.date)}
              </p>
            </div>
          )}
          {playlist.songs.length >= 0 && (
            <div className="flex items-center gap-1">
              <Music3 className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{playlist.songs.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
