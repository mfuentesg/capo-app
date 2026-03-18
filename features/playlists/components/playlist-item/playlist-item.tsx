"use client"

import { memo } from "react"
import { Calendar, Music3, Lock, Globe, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { Playlist } from "@/features/playlists/types"
import { useTranslation } from "@/hooks/use-translation"
import { formatDate } from "@/lib/utils"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"
import { TeamIcon } from "@/components/ui/icon-picker"

interface PlaylistItemProps {
  playlist: Playlist
  isSelected: boolean
  onSelect: (playlist: Playlist) => void
  ownershipLabel?: string
  bucketColor?: string
  teamIcon?: string | null
}

export const PlaylistItem = memo(function PlaylistItem({
  playlist,
  isSelected,
  onSelect,
  ownershipLabel,
  bucketColor,
  teamIcon
}: PlaylistItemProps) {
  const { t } = useTranslation()
  const privateTooltipIds = createOverlayIds(`playlist-private-tooltip-${playlist.id}`)
  const publicTooltipIds = createOverlayIds(`playlist-public-tooltip-${playlist.id}`)

  return (
    <div
      onClick={() => onSelect(playlist)}
      className={`relative flex w-full items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors border touch-manipulation ${
        isSelected
          ? "bg-primary/10 border-primary"
          : "bg-linear-to-br from-accent-playlists/5 via-accent-playlists/3 to-transparent border-border/60 hover:bg-muted/50 hover:border-border"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-playlists/15 shrink-0">
        <Music3 className="h-5 w-5 text-accent-playlists" />
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
              <TooltipTrigger
                asChild
                id={privateTooltipIds.triggerId}
                aria-describedby={privateTooltipIds.contentId}
              >
                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent id={privateTooltipIds.contentId}>
                <p>{t.playlistItem.privatePlaylist}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {playlist.visibility === "public" && (
            <Tooltip>
              <TooltipTrigger
                asChild
                id={publicTooltipIds.triggerId}
                aria-describedby={publicTooltipIds.contentId}
              >
                <div className="flex items-center gap-0.5 shrink-0">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  {playlist.allowGuestEditing && (
                    <Users className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent id={publicTooltipIds.contentId}>
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
              <p className="text-xs text-muted-foreground">{formatDate(playlist.date)}</p>
            </div>
          )}
          {playlist.songs.length >= 0 && (
            <div className="flex items-center gap-1">
              <Music3 className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{playlist.songs.length}</p>
            </div>
          )}
          {ownershipLabel && bucketColor && (
            <span
              className="shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                color: bucketColor,
                background: `color-mix(in oklch, ${bucketColor} 15%, transparent)`
              }}
            >
              <span
                data-testid="ownership-dot"
                className="h-1.5 w-1.5 rounded-sm shrink-0"
                style={{ background: bucketColor }}
              />
              {ownershipLabel}
            </span>
          )}
        </div>
      </div>

      {bucketColor && teamIcon && (
        <span
          className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[9px]"
          style={{ background: `color-mix(in oklch, ${bucketColor} 25%, transparent)` }}
          aria-hidden
        >
          <TeamIcon icon={teamIcon} className="size-2.5" />
        </span>
      )}
    </div>
  )
})
