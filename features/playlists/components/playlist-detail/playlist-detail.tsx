"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  X,
  Calendar as CalendarIcon,
  Pencil,
  Check,
  Trash2,
  Plus,
  ListMusic,
  Globe,
  Copy,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn, formatLongDate, formatDateISO } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useLocale } from "@/features/settings"
import type { Playlist } from "@/features/playlists/types"
import type { SongWithPosition, PlaylistWithSongs } from "@/types/extended"
import { DraggablePlaylist } from "@/features/playlists/utils"
import { usePlaylists } from "@/features/playlists/contexts"
import { api } from "@/features/songs"
import type { Song } from "@/features/songs"

interface PlaylistDetailProps {
  playlist: Playlist
  onClose: () => void
  onUpdate: (playlistId: string, updates: Partial<Playlist>) => void
  onDelete: (playlistId: string) => void
}

function EditableField({
  value,
  onSave,
  className,
  inputClassName,
  multiline = false,
  allowEmpty = false,
  label
}: {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  multiline?: boolean
  allowEmpty?: boolean
  label?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (!multiline) {
        ;(inputRef.current as HTMLInputElement).select()
      }
    }
  }, [isEditing, multiline])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed !== value && (trimmed || allowEmpty)) {
      onSave(trimmed)
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-1.5">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("min-h-20 px-2 py-1 border rounded resize-none", inputClassName)}
            rows={3}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("h-8 px-2", inputClassName)}
          />
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSave}>
          <Check className="h-5 w-5 text-green-600" />
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded px-1 -ml-1 hover:bg-muted transition-colors text-left",
        className
      )}
    >
      <span className={multiline ? "whitespace-pre-wrap" : "truncate"}>{value || label}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
    </button>
  )
}

export function PlaylistDetail({ playlist, onClose, onUpdate, onDelete }: PlaylistDetailProps) {
  const { reorderPlaylistSongs } = usePlaylists()
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const [songsWithPosition, setSongsWithPosition] = useState<SongWithPosition[]>([])

  useEffect(() => {
    async function loadSongs() {
      const songs = await api.getSongsByIds(playlist.songs)
      const songsWithPos = (songs as Song[]).map((song, index) => ({
        ...song,
        position: index
      }))
      setSongsWithPosition(songsWithPos)
    }
    loadSongs()
  }, [playlist.songs])

  // Create PlaylistWithSongs object
  const playlistWithSongs = useMemo<PlaylistWithSongs>(
    () => ({
      ...playlist,
      songs: songsWithPosition
    }),
    [playlist, songsWithPosition]
  )

  const handleSongReorder = async (sourceIndex: number, destinationIndex: number) => {
    reorderPlaylistSongs(playlist.id, sourceIndex, destinationIndex)
  }

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="shrink-0 flex flex-col border-b bg-background p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <EditableField
              value={playlist.name}
              onSave={(value) => onUpdate(playlist.id, { name: value })}
              className="text-lg font-semibold"
              label={t.common.clickToAdd}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <EditableField
          value={playlist.description || ""}
          onSave={(value) => onUpdate(playlist.id, { description: value || undefined })}
          className="text-sm text-muted-foreground mt-1"
          inputClassName="text-sm"
          multiline
          allowEmpty
          label={t.playlistDetail.addDescription}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Delete Button */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={() => onDelete(playlist.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.playlistDetail.deletePlaylist}</span>
          </Button>
        </div>
        {/* Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t.playlistDetail.details}</h3>
          <div className="flex flex-wrap gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-background border px-3 py-1.5 h-auto font-normal",
                    !playlist.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {playlist.date
                    ? formatLongDate(new Date(playlist.date), locale)
                    : t.playlistDetail.pickDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={playlist.date ? new Date(playlist.date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onUpdate(playlist.id, { date: formatDateISO(date) })
                      setIsCalendarOpen(false)
                    }
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 rounded-full bg-background border px-3 py-1.5">
              <ListMusic className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{playlist.songs.length}</span>
              <span className="text-xs text-muted-foreground">
                {playlist.songs.length === 1 ? t.playlistDetail.song : t.playlistDetail.songsPlural}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t.playlistDetail.privacySharing}</h3>
          <div className="space-y-3 max-w-md">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <label className="text-sm font-medium">{t.playlistDetail.publicVisibility}</label>
                <p className="text-xs text-muted-foreground">
                  <Globe className="h-3 w-3 inline mr-1" />
                  {t.playlistDetail.anyoneWithLink}
                </p>
              </div>
              <Switch
                defaultChecked={playlist.visibility === "public"}
                onCheckedChange={(checked) => {
                  onUpdate(playlist.id, { visibility: checked ? "public" : "private" })
                }}
              />
            </div>
            {playlist.visibility === "public" && playlist.shareCode && (
              <div className="space-y-2">
                <p className="text-xs font-medium">{t.playlistDetail.publicUrl}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-2 py-1.5 rounded text-xs font-mono">
                    {playlist.shareCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/dashboard/playlists/${playlist.shareCode}`
                      )
                      toast.success(t.playlistDetail.copied)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    {t.playlistDetail.copy}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`/dashboard/playlists/${playlist.shareCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t.playlistDetail.guestEditing}</label>
                <p className="text-xs text-muted-foreground">{t.playlistDetail.guestsCanReorder}</p>
              </div>
              <Switch
                defaultChecked={playlist.allowGuestEditing || false}
                onCheckedChange={(checked) => {
                  onUpdate(playlist.id, { allowGuestEditing: checked })
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">{t.playlistDetail.songs}</h3>
          {playlist.songs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListMusic />
                </EmptyMedia>
                <EmptyTitle>{t.playlistDetail.noSongsInPlaylist}</EmptyTitle>
                <EmptyDescription>{t.playlistDetail.addSongsDescription}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t.playlistDetail.addSongsButton}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <DraggablePlaylist
              playlist={playlistWithSongs}
              songs={songsWithPosition}
              onPlaylistSort={handleSongReorder}
            />
          )}
        </div>
      </div>
    </div>
  )
}
